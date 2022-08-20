import { quat, vec3 } from 'gl-matrix';
import { createEntity } from '../ecs/entity';
import { Cell } from '../resources/levels';
import {
    createCameraComponent,
    createPlayerComponent,
    createCubeComponent,
    createTransformComponent,
} from './components';

export const createCubeEntity = (name: string, x: number, z: number, kind: Cell) =>
    createEntity(name, [
        createCubeComponent(x, z, kind),
        createTransformComponent(vec3.fromValues(0, 0, 0), quat.fromValues(0, 0, 0, 1), vec3.fromValues(1, 1, 1)),
    ]);

export type CubeEntity = ReturnType<typeof createCubeEntity>;

// ===

export const createPlayerEntity = (x: number, z: number) =>
    createEntity('Player', [
        createPlayerComponent(x, z),
        createTransformComponent(
            vec3.fromValues(0, 2.35, 0),
            quat.fromValues(0, 0, 0, 1),
            vec3.fromValues(0.5, 1, 0.5),
        ),
    ]);

export type PlayerEntity = ReturnType<typeof createPlayerEntity>;

// ===

export const createCameraEntity = (position: vec3, lookAt: vec3, aspect: number) =>
    createEntity('Camera', [createCameraComponent(position, lookAt, aspect)]);

export type CameraEntity = ReturnType<typeof createCameraEntity>;
