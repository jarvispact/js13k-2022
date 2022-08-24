import { createEntity } from '../ecs/entity';
import {
    createCameraComponent,
    createPlayerComponent,
    createTileComponent,
    createTransformComponent,
    createTargetTransformComponent,
    TileArgs,
    TransformArgs,
    TargetTransformArgs,
    PlayerArgs,
    CameraArgs,
} from './components';

export const createTileEntity = (
    name: string,
    {
        tile,
        transform,
        targetTransform,
    }: { tile: TileArgs; transform: TransformArgs; targetTransform: TargetTransformArgs },
) =>
    createEntity(name, [
        createTileComponent(tile),
        createTransformComponent(transform),
        createTargetTransformComponent(targetTransform),
    ]);

export type TileEntity = ReturnType<typeof createTileEntity>;

// ===

export const createPlayerEntity = ({
    player,
    transform,
    targetTransform,
}: {
    player: PlayerArgs;
    transform: TransformArgs;
    targetTransform: TargetTransformArgs;
}) =>
    createEntity('Player', [
        createPlayerComponent(player),
        createTransformComponent(transform),
        createTargetTransformComponent(targetTransform),
    ]);

export type PlayerEntity = ReturnType<typeof createPlayerEntity>;

// ===

export const createCameraEntity = (data: CameraArgs) => createEntity('Camera', [createCameraComponent(data)]);

export type CameraEntity = ReturnType<typeof createCameraEntity>;
