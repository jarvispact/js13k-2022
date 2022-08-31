import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { System } from '../ecs/system';
import { has } from '../ecs/world';
import { TileType } from '../game/components';
import { CameraEntity, TileEntity, PlayerEntity } from '../game/entities';
import { World } from '../game/world';
import { cube } from '../resources/cube';
import { EMPTY_TILE, Tile } from '../resources/levels';
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
struct M { vec4 color; };
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
struct M { vec4 color; };
uniform EU { T t; M m; };
in vec3 vN;
vec3 lightDiffuse = vec3(0.8, 0.8, 0.8);
out vec4 outColor;
void main() {
    vec3 ambient = m.color.rgb * 0.05;
    vec3 direction = normalize(vec3(0.5, 1.0, 3.0));
    vec3 normal = normalize(vN);
    float diff = max(dot(normal, direction), 0.0);
    vec3 diffuse = lightDiffuse * m.color.a * diff * m.color.rgb;
    outColor = vec4(ambient + diffuse, 1.0);
}
`.trim();

const sceneUboConfig = {
    'c.vm': mat4.create(),
    'c.pm': mat4.create(),
};

const entityUboConfig = {
    't.mm': mat4.create(),
    'm.color': vec4.create(),
};

type CacheEntry<T> = { entity: T; update: () => void; cleanup: () => void };

const createPlayerGeometry = () => {
    const headPositions = [...cube.positions];
    const leftArmPositions = [...cube.positions];
    const rightArmPositions = [...cube.positions];
    const bodyPositions = [...cube.positions];

    const tmp = vec3.create();

    const headMatrix = mat4.create();

    mat4.fromRotationTranslationScale(
        headMatrix,
        quat.fromValues(0, 0, 0, 1),
        vec3.fromValues(0, 0.35, 0),
        vec3.fromValues(0.25, 0.25, 0.25),
    );

    for (let i = 0; i < headPositions.length; i += 3) {
        const x = headPositions[i];
        const y = headPositions[i + 1];
        const z = headPositions[i + 2];
        vec3.set(tmp, x, y, z);
        vec3.transformMat4(tmp, tmp, headMatrix);
        headPositions[i] = tmp[0];
        headPositions[i + 1] = tmp[1];
        headPositions[i + 2] = tmp[2];
    }

    const leftArmMatrix = mat4.create();

    mat4.fromRotationTranslationScale(
        leftArmMatrix,
        quat.fromValues(0, 0, 0, 1),
        vec3.fromValues(-0.35, -0.25, 0),
        vec3.fromValues(0.1, 0.2, 0.1),
    );

    for (let i = 0; i < leftArmPositions.length; i += 3) {
        const x = leftArmPositions[i];
        const y = leftArmPositions[i + 1];
        const z = leftArmPositions[i + 2];
        vec3.set(tmp, x, y, z);
        vec3.transformMat4(tmp, tmp, leftArmMatrix);
        leftArmPositions[i] = tmp[0];
        leftArmPositions[i + 1] = tmp[1];
        leftArmPositions[i + 2] = tmp[2];
    }

    const rightArmMatrix = mat4.create();

    mat4.fromRotationTranslationScale(
        rightArmMatrix,
        quat.fromValues(0, 0, 0, 1),
        vec3.fromValues(0.35, -0.25, 0),
        vec3.fromValues(0.1, 0.2, 0.1),
    );

    for (let i = 0; i < rightArmPositions.length; i += 3) {
        const x = rightArmPositions[i];
        const y = rightArmPositions[i + 1];
        const z = rightArmPositions[i + 2];
        vec3.set(tmp, x, y, z);
        vec3.transformMat4(tmp, tmp, rightArmMatrix);
        rightArmPositions[i] = tmp[0];
        rightArmPositions[i + 1] = tmp[1];
        rightArmPositions[i + 2] = tmp[2];
    }

    const bodyMatrix = mat4.create();

    mat4.fromRotationTranslationScale(
        bodyMatrix,
        quat.fromValues(0, 0, 0, 1),
        vec3.fromValues(0, -0.5, 0),
        vec3.fromValues(0.2, 0.5, 0.2),
    );

    for (let i = 0; i < bodyPositions.length; i += 3) {
        const x = bodyPositions[i];
        const y = bodyPositions[i + 1];
        const z = bodyPositions[i + 2];
        vec3.set(tmp, x, y, z);
        vec3.transformMat4(tmp, tmp, bodyMatrix);
        bodyPositions[i] = tmp[0];
        bodyPositions[i + 1] = tmp[1];
        bodyPositions[i + 2] = tmp[2];
    }

    // last index (23) + 1 = 24
    const indices = [
        ...cube.indices,
        ...cube.indices.map((i) => 24 + i),
        ...cube.indices.map((i) => 48 + i),
        ...cube.indices.map((i) => 72 + i),
    ];

    return {
        positions: new Float32Array([...headPositions, ...bodyPositions, ...leftArmPositions, ...rightArmPositions]),
        normals: new Float32Array([...cube.normals, ...cube.normals, ...cube.normals, ...cube.normals]),
        indices: new Uint32Array(indices),
        indicesLength: indices.length,
    };
};

const cubeMesh = {
    positions: new Float32Array(cube.positions),
    normals: new Float32Array(cube.normals),
    indices: new Uint32Array(cube.indices),
    indicesLength: cube.indicesLength,
};

const playerMesh = createPlayerGeometry();

export const createRenderSystem = (world: World): System => {
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
        camera.data.position[2] = camera.data.aspect < 0.48 ? 20 : window.innerWidth < 1200 ? 16 : 12;
        camera.data.position[1] = window.innerWidth < 1200 ? 6 : 3;

        mat4.lookAt(camera.data.viewMatrix, camera.data.position, camera.data.lookAt, camera.data.upVector);

        mat4.perspective(
            camera.data.projectionMatrix,
            camera.data.fov,
            camera.data.aspect,
            camera.data.near,
            camera.data.far,
        );

        sceneUbo.setMat4('c.vm', camera.data.viewMatrix).setMat4('c.pm', camera.data.projectionMatrix).update();
    });

    const tileEntities = world.createQuery<TileEntity>(has(TileType)).entities;

    const tileRenderCache: CacheEntry<TileEntity>[] = [];
    const cachedTileEntityMap: Record<string, number> = {};

    const playerColor = vec4.fromValues(0.31, 0.27, 0.89, 0.8);

    const colorForCell: { [K in Tile]: vec4 } = {
        '0': vec4.fromValues(1, 1, 1, 0.3),
        '1': vec4.fromValues(1, 1, 1, 0.3),
        '2': vec4.fromValues(1, 1, 1, 0.3),
        '3': vec4.fromValues(0, 1, 0, 0.8),
        '4': vec4.fromValues(1, 1, 1, 0.3),
    };

    const cacheTileEntity = (entity: TileEntity): CacheEntry<TileEntity> => {
        const idx = cachedTileEntityMap[entity.name];
        if (idx !== undefined) return tileRenderCache[cachedTileEntityMap[entity.name]];

        const tileComponent = entity.getComponent('Tile').data;
        const transformComponent = entity.getComponent('Transform').data;

        const vao = createWebgl2VertexArray(gl);

        const positionsBuffer = createWebgl2ArrayBuffer(gl, cubeMesh.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const normalsBuffer = createWebgl2ArrayBuffer(gl, cubeMesh.normals);
        setupWebgl2VertexAttribPointer(gl, 1, 3);

        const indicesBuffer = createWebgl2ElementArrayBuffer(gl, cubeMesh.indices);

        const update = () => {
            if (tileComponent.tile === EMPTY_TILE) return;
            entityUbo
                .setMat4('t.mm', transformComponent.modelMatrix)
                .setVec4('m.color', colorForCell[tileComponent.tile])
                .update();
            gl.bindVertexArray(vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.drawElements(gl.TRIANGLES, cubeMesh.indicesLength, gl.UNSIGNED_INT, 0);
        };

        const cleanup = () => {
            gl.deleteBuffer(positionsBuffer);
            gl.deleteBuffer(normalsBuffer);
            gl.deleteBuffer(indicesBuffer);
            gl.deleteVertexArray(vao);
        };

        const cachedEntry: CacheEntry<TileEntity> = {
            entity,
            update,
            cleanup,
        };

        tileRenderCache.push(cachedEntry);
        cachedTileEntityMap[entity.name] = tileRenderCache.length - 1;
        return cachedEntry;
    };

    window.addEventListener('unload', () => {
        sceneUbo.cleanup();

        for (let i = 0; i < tileRenderCache.length; i++) {
            const cachedEntry = tileRenderCache[i];
            cachedEntry.cleanup();
        }
    });

    const cachedPlayer: CacheEntry<PlayerEntity> | null = null;

    const cachePlayerEntity = (entity: PlayerEntity): CacheEntry<PlayerEntity> => {
        if (cachedPlayer) return cachedPlayer;

        const transformComponent = entity.getComponent('Transform').data;

        const vao = createWebgl2VertexArray(gl);

        const positionsBuffer = createWebgl2ArrayBuffer(gl, playerMesh.positions);
        setupWebgl2VertexAttribPointer(gl, 0, 3);

        const normalsBuffer = createWebgl2ArrayBuffer(gl, playerMesh.normals);
        setupWebgl2VertexAttribPointer(gl, 1, 3);

        const indicesBuffer = createWebgl2ElementArrayBuffer(gl, playerMesh.indices);

        const update = () => {
            entityUbo.setMat4('t.mm', transformComponent.modelMatrix).setVec4('m.color', playerColor).update();
            gl.bindVertexArray(vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.drawElements(gl.TRIANGLES, playerMesh.indicesLength, gl.UNSIGNED_INT, 0);
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
        const camera = world.getEntity<CameraEntity>('Camera').getComponent('Camera');

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // TODO: cache operations
        sceneUbo.setMat4('c.vm', camera.data.viewMatrix).setMat4('c.pm', camera.data.projectionMatrix).update();

        for (let i = 0; i < tileEntities.length; i++) {
            const cubeEntity = tileEntities[i];
            const cachedEntry = cacheTileEntity(cubeEntity);
            cachedEntry.update();
        }

        const player = world.getEntity<PlayerEntity>('Player');
        if (player) {
            const cachedPlayer = cachePlayerEntity(player);
            cachedPlayer.update();
        }

        return () => {
            sceneUbo.cleanup();

            for (let i = 0; i < tileRenderCache.length; i++) {
                const cachedEntry = tileRenderCache[i];
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
