import { vec3 } from 'gl-matrix';
import { createEntity } from '../ecs/entity';
import { CubeKind } from '../resources/levels';
import { createCameraComponent, createCPlayerComponent, createCubeComponent } from './components';

export const createCubeEntity = (name: string, x: number, z: number, kind: CubeKind) =>
    createEntity(name, [createCubeComponent(x, z, kind)]);

export type CubeEntity = ReturnType<typeof createCubeEntity>;

// ===

export const createPlayerEntity = (x: number, z: number) => createEntity('Player', [createCPlayerComponent(x, z)]);

export type PlayerEntity = ReturnType<typeof createPlayerEntity>;

// ===

export const createCameraEntity = (position: vec3, lookAt: vec3, aspect: number) =>
    createEntity('Camera', [createCameraComponent(position, lookAt, aspect)]);

export type CameraEntity = ReturnType<typeof createCameraEntity>;
