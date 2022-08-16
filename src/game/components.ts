import { mat4, vec3 } from 'gl-matrix';
import { createComponent } from '../ecs/component';
import { CubeKind } from '../resources/levels';

export const CubeType = 'Cube';

export const createCubeComponent = (x: number, z: number, kind: CubeKind) => createComponent(CubeType, { x, z, kind });

export type CubeComponent = ReturnType<typeof createCubeComponent>;

// ===

export const PlayerType = 'Player';

export const createCPlayerComponent = (x: number, z: number) => createComponent(PlayerType, { x, z });

export type PlayerComponent = ReturnType<typeof createCPlayerComponent>;

// ===

export const CameraType = 'Camera';

export const createCameraComponent = (position: vec3, lookAt: vec3, aspect: number) => {
    const data = {
        position,
        lookAt,
        upVector: vec3.fromValues(0, 1, 0),
        viewMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
        projectionMatrix: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
        fov: 45,
        aspect,
        near: 0.1,
        far: 1000,
    };

    mat4.lookAt(data.viewMatrix, data.position, data.lookAt, data.upVector);
    mat4.perspective(data.projectionMatrix, data.fov, data.aspect, data.near, data.far);

    return createComponent(CameraType, data);
};

export type CameraComponent = ReturnType<typeof createCameraComponent>;
