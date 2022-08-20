import { mat4, vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { Cell, PLAY } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { createCameraEntity, createCubeEntity, createPlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

export const spawnEntitiesSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    const { levels, currentLevel } = world.getState();
    const level = levels[currentLevel];

    world.spawnEntity(
        createCameraEntity(
            vec3.fromValues(0, 10, 10),
            vec3.fromValues(0, 0, 0),
            window.innerWidth / window.innerHeight,
        ),
    );

    const playerStart = { x: 0, z: 0 };
    const playerPosition = vec3.create();

    const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

    for (let z = 0; z < level.length; z++) {
        const column = level[z];
        const mapX = createMap(0, column.length - 1, -((column.length - 1) / 2), (column.length - 1) / 2);

        for (let x = 0; x < column.length; x++) {
            const kind = column[x] as Cell;
            const cubeEntity = createCubeEntity(`Cube-${x}-${z}`, x, z, kind);
            const t = cubeEntity.getComponent('Transform');

            t.data.position[0] = mapX(x) * 2.35;
            t.data.position[1] = 0;
            t.data.position[2] = mapZ(z) * 2.35;

            mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.rotation, t.data.position, t.data.scale);

            world.spawnEntity(cubeEntity);

            if (kind === PLAY) {
                playerStart.x = x;
                playerStart.z = z;
                playerPosition[0] = mapX(x) * 2.35;
                playerPosition[1] = 2.35;
                playerPosition[2] = mapZ(z) * 2.35;
            }
        }
    }

    const player = createPlayerEntity(playerStart.x, playerStart.z);
    const t = player.getComponent('Transform');

    t.data.position = playerPosition;
    mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.rotation, t.data.position, t.data.scale);

    world.spawnEntity(player);
    world.dispatchEvent({ type: 'PLAYER_SPAWNED', payload: player });
};
