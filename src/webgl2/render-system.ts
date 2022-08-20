import { mat4, vec3 } from 'gl-matrix';
import { System } from '../ecs/system';
import { has, World } from '../ecs/world';
import { CubeType } from '../game/components';
import { CameraEntity, CubeEntity, PlayerEntity } from '../game/entities';
import { WorldAction, WorldEvent, WorldState } from '../game/world';
import { cube } from '../resources/cube';
import { Cell } from '../resources/levels';
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
struct C { mat4 vm; mat4 pm; };
uniform SU { C c; };
struct T { mat4 mm; };
struct M { vec3 color; };
uniform EU { T t; M m; };
out vec3 vN;
void main() {
    vN = normal;
    vec4 worldPos = t.mm * vec4(position, 1.0);
    gl_Position = c.pm * c.vm * worldPos;
}
`.trim();

const fs = `
#version 300 es
precision highp float;
struct T { mat4 mm; };
struct M { vec3 color; };
uniform EU { T t; M m; };
in vec3 vN;
vec3 lightDiffuse = vec3(0.8, 0.8, 0.8);
out vec4 outColor;
void main() {
    vec3 ambient = m.color * 0.05;
    vec3 direction = normalize(vec3(0.5, 1.0, 3.0));
    vec3 normal = normalize(vN);
    float diff = max(dot(normal, direction), 0.0);
    vec3 diffuse = lightDiffuse * diff * m.color;
    outColor = vec4(ambient + diffuse, 1.0);
}
`.trim();

const sceneUboConfig = {
    'c.vm': mat4.create(),
    'c.pm': mat4.create(),
};

const entityUboConfig = {
    't.mm': mat4.create(),
    'm.color': vec3.create(),
};

type CacheEntry<T> = { entity: T; update: () => void; cleanup: () => void };

export const createRenderSystem = (world: World<WorldState, WorldAction, WorldEvent>): System => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = getWebgl2Context(canvas);
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    const vertexShader = createWebgl2Shader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = createWebgl2Shader(gl, gl.FRAGMENT_SHADER, fs);
    const shaderProgram = createWebgl2Program(gl, vertexShader, fragmentShader);
    gl.useProgram(shaderProgram);

    const sceneUbo = new UBO(gl, 'SU', 0, sceneUboConfig).bindToShaderProgram(shaderProgram);
    const entityUbo = new UBO(gl, 'EU', 1, entityUboConfig).bindToShaderProgram(shaderProgram);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);

        const camera = world.getEntity<CameraEntity>('Camera').getComponent('Camera');
        camera.data.aspect = window.innerWidth / window.innerHeight;

        mat4.perspective(
            camera.data.projectionMatrix,
            camera.data.fov,
            camera.data.aspect,
            camera.data.near,
            camera.data.far,
        );

        sceneUbo.setMat4('c.vm', camera.data.viewMatrix).setMat4('c.pm', camera.data.projectionMatrix).update();
    });

    const cubeEntities = world.createQuery<CubeEntity>(has(CubeType)).entities;

    const cubeRenderCache: CacheEntry<CubeEntity>[] = [];
    const cachedCubeEntityMap: Record<string, number> = {};

    const playerColor = vec3.fromValues(1, 1, 1);

    const colorForCell: { [K in Cell]: vec3 } = {
        '0': vec3.fromValues(1, 0, 0),
        '1': vec3.fromValues(1, 1, 1),
        '2': vec3.fromValues(0, 1, 0),
        '3': vec3.fromValues(1, 1, 1),
    };

    const cacheCubeEntity = (entity: CubeEntity): CacheEntry<CubeEntity> => {
        const idx = cachedCubeEntityMap[entity.name];
        if (idx !== undefined) return cubeRenderCache[cachedCubeEntityMap[entity.name]];

        const cubeComponent = entity.getComponent('Cube').data;
        const transformComponent = entity.getComponent('Transform').data;

        const vao = createWebgl2VertexArray(gl);

        const positionsBuffer = createWebgl2ArrayBuffer(gl, cube.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const normalsBuffer = createWebgl2ArrayBuffer(gl, cube.normals);
        setupWebgl2VertexAttribPointer(gl, 1, 3);

        const indicesBuffer = createWebgl2ElementArrayBuffer(gl, cube.indices);

        const update = () => {
            entityUbo
                .setMat4('t.mm', transformComponent.modelMatrix)
                .setVec3('m.color', colorForCell[cubeComponent.kind])
                .update();
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

        const cachedEntry: CacheEntry<CubeEntity> = {
            entity,
            update,
            cleanup,
        };

        cubeRenderCache.push(cachedEntry);
        cachedCubeEntityMap[entity.name] = cubeRenderCache.length - 1;
        return cachedEntry;
    };

    window.addEventListener('unload', () => {
        sceneUbo.cleanup();

        for (let i = 0; i < cubeRenderCache.length; i++) {
            const cachedEntry = cubeRenderCache[i];
            cachedEntry.cleanup();
        }
    });

    const cachedPlayer: CacheEntry<PlayerEntity> | null = null;

    const cachePlayerEntity = (entity: PlayerEntity): CacheEntry<PlayerEntity> => {
        if (cachedPlayer) return cachedPlayer;

        const transformComponent = entity.getComponent('Transform').data;

        const vao = createWebgl2VertexArray(gl);

        const positionsBuffer = createWebgl2ArrayBuffer(gl, cube.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const normalsBuffer = createWebgl2ArrayBuffer(gl, cube.normals);
        setupWebgl2VertexAttribPointer(gl, 1, 3);

        const indicesBuffer = createWebgl2ElementArrayBuffer(gl, cube.indices);

        const update = () => {
            entityUbo.setMat4('t.mm', transformComponent.modelMatrix).setVec3('m.color', playerColor).update();
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

        return {
            entity,
            update,
            cleanup,
        };
    };

    return () => {
        const status = world.getState().status;

        if (status === 'idle' || status === 'completed' || status === 'game-over') {
            console.log(status);
            return;
        }

        const camera = world.getEntity<CameraEntity>('Camera').getComponent('Camera');

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: cache operations
        sceneUbo.setMat4('c.vm', camera.data.viewMatrix).setMat4('c.pm', camera.data.projectionMatrix).update();

        for (let i = 0; i < cubeEntities.length; i++) {
            const cubeEntity = cubeEntities[i];
            const cachedEntry = cacheCubeEntity(cubeEntity);
            cachedEntry.update();
        }

        const player = world.getEntity<PlayerEntity>('Player');
        if (player) {
            const cachedPlayer = cachePlayerEntity(player);
            cachedPlayer.update();
        }

        return () => {
            sceneUbo.cleanup();

            for (let i = 0; i < cubeRenderCache.length; i++) {
                const cachedEntry = cubeRenderCache[i];
                cachedEntry.cleanup();
            }

            const player = world.getEntity<PlayerEntity>('Player');
            if (player) {
                const cachedPlayer = cachePlayerEntity(player);
                cachedPlayer.cleanup();
            }
        };
    };
};
