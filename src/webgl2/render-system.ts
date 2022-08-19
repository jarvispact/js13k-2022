import { mat4, quat, vec3 } from 'gl-matrix';
import { System } from '../ecs/system';
import { has, World } from '../ecs/world';
import { CubeType, PlayerType } from '../game/components';
import { CameraEntity, CubeEntity, PlayerEntity } from '../game/entities';
import { WorldAction, WorldEvent, WorldState } from '../game/world';
import { cube } from '../resources/cube';
import { createMap } from '../utils/create-map';
import {
    createWebgl2ArrayBuffer,
    createWebgl2ElementArrayBuffer,
    createWebgl2Program,
    createWebgl2Shader,
    createWebgl2VertexArray,
    getWebgl2Context,
    setupWebgl2VertexAttribPointer,
    UBO,
} from './utils';

const vs = `
#version 300 es
 
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;

struct Camera {
    vec3 translation;
    mat4 viewMatrix;
    mat4 projectionMatrix;
};

uniform CameraUniforms {
    Camera camera;
};

struct Transform {
    mat4 modelMatrix;
};

uniform TransformUniforms {
    Transform transform;
};

out vec3 vNormal;
 
void main() {
    vNormal = normal;
    vec4 worldPos = transform.modelMatrix * vec4(position, 1.0);
    gl_Position = camera.projectionMatrix * camera.viewMatrix * worldPos;
}
`.trim();

const fs = `
#version 300 es

precision highp float;

in vec3 vNormal;

vec3 lightDirection = vec3(0.5, 1.0, 3.0);
vec3 lightDiffuse = vec3(0.8, 0.8, 0.8);

out vec4 outColor;
 
void main() {
    vec3 texel = vec3(1.0, 1.0, 1.0);
    vec3 ambient = texel * 0.01;
    vec3 direction = normalize(lightDirection);
    vec3 normal = normalize(vNormal);
    float diff = max(dot(normal, direction), 0.0);
    vec3 diffuse = lightDiffuse * diff * texel;
    outColor = vec4(ambient + diffuse, 1.0);
}
`.trim();

const cameraUboConfig = {
    'camera.translation': vec3.create(),
    'camera.viewMatrix': mat4.create(),
    'camera.projectionMatrix': mat4.create(),
};

const transformUboConfig = {
    'transform.modelMatrix': mat4.create(),
};

type CubeCacheEntry = { entity: CubeEntity; update: () => void; cleanup: () => void };

type PositionMappers = {
    mapXForZ: (z: number) => (input: number) => number;
    mapZ: (input: number) => number;
};

export const createRenderSystem = (world: World<WorldState, WorldAction, WorldEvent>): System => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mappers: PositionMappers = {
        mapXForZ: () => (input) => input,
        mapZ: (input) => input,
    };

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'START' || action.type == 'LEVEL_UP' || action.type === 'GAME_OVER') {
            const { levels, currentLevel } = newState;
            const level = levels[currentLevel];
            mappers.mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
            mappers.mapXForZ = (z) =>
                createMap(0, level[z].length - 1, -((level[z].length - 1) / 2), (level[z].length - 1) / 2);
        }
    });

    const gl = getWebgl2Context(canvas);
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    const cameraUbo = new UBO(gl, 'CameraUniforms', 0, cameraUboConfig).bindToShaderProgram(shaderProgram);
    const transformUbo = new UBO(gl, 'TransformUniforms', 1, transformUboConfig).bindToShaderProgram(shaderProgram);

    const cubeEntities = world.createQuery<CubeEntity>(has(CubeType)).entities;
    const playerEntities = world.createQuery<PlayerEntity>(has(PlayerType)).entities;

    const cubeRenderCache: CubeCacheEntry[] = [];
    const cachedCubeEntityMap: Record<string, number> = {};

    const modelMatrix = mat4.create();
    const rotation = quat.fromValues(0, 0, 0, 1);
    const translation = vec3.fromValues(0, 0, 0);
    const scale = vec3.fromValues(1, 1, 1);

    const cacheCubeEntity = (entity: CubeEntity): CubeCacheEntry => {
        const idx = cachedCubeEntityMap[entity.name];
        if (idx !== undefined) return cubeRenderCache[cachedCubeEntityMap[entity.name]];

        const cubeComponent = entity.getComponent('Cube').data;

        const vao = createWebgl2VertexArray(gl);

        const positionsBuffer = createWebgl2ArrayBuffer(gl, cube.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const normalsBuffer = createWebgl2ArrayBuffer(gl, cube.normals);
        setupWebgl2VertexAttribPointer(gl, 1, 3);

        const indicesBuffer = createWebgl2ElementArrayBuffer(gl, cube.indices);

        const update = () => {
            vec3.set(
                translation,
                mappers.mapXForZ(cubeComponent.z)(cubeComponent.x) * 2.5,
                0,
                mappers.mapZ(cubeComponent.z) * 2.5,
            );

            mat4.fromRotationTranslationScale(modelMatrix, rotation, translation, scale);
            transformUbo.setMat4('transform.modelMatrix', modelMatrix).update();
            gl.bindVertexArray(vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.drawElements(gl.TRIANGLES, cube.indicesLength, gl.UNSIGNED_INT, 0);
        };

        const cleanup = () => {
            gl.deleteBuffer(positionsBuffer);
            gl.deleteBuffer(normalsBuffer);
            gl.deleteBuffer(indicesBuffer);
            gl.deleteVertexArray(vao);
        };

        const cachedEntry: CubeCacheEntry = {
            entity,
            update,
            cleanup,
        };

        cubeRenderCache.push(cachedEntry);
        cachedCubeEntityMap[entity.name] = cubeRenderCache.length - 1;
        return cachedEntry;
    };

    return () => {
        const camera = world.getEntity<CameraEntity>('Camera').getComponent('Camera');

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: cache operations
        cameraUbo
            .setVec3('camera.translation', camera.data.position)
            .setMat4('camera.viewMatrix', camera.data.viewMatrix)
            .setMat4('camera.projectionMatrix', camera.data.projectionMatrix)
            .update();

        for (let i = 0; i < cubeEntities.length; i++) {
            const cubeEntity = cubeEntities[i];
            const cachedEntry = cacheCubeEntity(cubeEntity);
            cachedEntry.update();
        }

        return () => {
            cameraUbo.cleanup();

            for (let i = 0; i < cubeRenderCache.length; i++) {
                const cachedEntry = cubeRenderCache[i];
                cachedEntry.cleanup();
            }
        };
    };
};
