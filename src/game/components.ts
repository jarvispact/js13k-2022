import { mat4, quat, vec3 } from 'gl-matrix';
import { createComponent } from '../ecs/component';
import { Tile } from '../resources/levels';
import { EasingFunction } from './easing';

export const TargetTransformType = 'TargetTransform';

export type TargetTransformArgs = {
    position: vec3;
    scale: vec3;
    easing: { function: EasingFunction; time: number; increment: number };
};

export const createTargetTransformComponent = (data: TargetTransformArgs) => createComponent(TargetTransformType, data);

export type TargetPositionComponent = ReturnType<typeof createTargetTransformComponent>;

// ===

export const TransformType = 'Transform';

export type TransformArgs = { position: vec3; scale: vec3 };

export const createTransformComponent = (data: TransformArgs) => {
    const _data = {
        position: data.position,
        rotation: quat.fromValues(0, 0, 0, 1),
        scale: data.scale,
        modelMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    };

    mat4.fromRotationTranslationScale(_data.modelMatrix, _data.rotation, _data.position, _data.scale);

    return createComponent(TransformType, _data);
};

export type TransformComponent = ReturnType<typeof createTransformComponent>;

// ===

export const TileType = 'Tile';

export type TileArgs = { x: number; z: number; tile: Tile };

export const createTileComponent = (data: TileArgs) => createComponent(TileType, data);

export type TileComponent = ReturnType<typeof createTileComponent>;

// ===

export const PlayerType = 'Player';

export type PlayerArgs = { x: number; z: number };

export const createPlayerComponent = (data: PlayerArgs) => createComponent(PlayerType, data);

export type PlayerComponent = ReturnType<typeof createPlayerComponent>;

// ===

export const CameraType = 'Camera';

export type CameraArgs = { position: vec3; lookAt: vec3; aspect: number };

export const createCameraComponent = (data: CameraArgs) => {
    const _data = {
        position: data.position,
        lookAt: data.lookAt,
        upVector: vec3.fromValues(0, 1, 0),
        viewMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
        projectionMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
        fov: 45,
        aspect: data.aspect,
        near: 0.1,
        far: 1000,
    };

    mat4.lookAt(_data.viewMatrix, _data.position, _data.lookAt, _data.upVector);
    mat4.perspective(_data.projectionMatrix, _data.fov, _data.aspect, _data.near, _data.far);

    return createComponent(CameraType, _data);
};

export type CameraComponent = ReturnType<typeof createCameraComponent>;
