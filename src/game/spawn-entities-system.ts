import { vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { Cell, PLAY } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { createCameraEntity, createCubeEntity, createPlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

export const spawnEntitiesSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    world.spawnEntity(
        createCameraEntity(
            vec3.fromValues(0, 10, 10),
            vec3.fromValues(0, 0, 0),
            window.innerWidth / window.innerHeight,
        ),
    );

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'START') {
            const level = newState.levels[newState.currentLevel];

            const playerStart = { x: 0, z: 0 };
            const playerPosition = vec3.create();
            const playerTarget = vec3.create();

            const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

            let i = 0;

            for (let z = 0; z < level.length; z++) {
                const column = level[z];
                const mapX = createMap(0, column.length - 1, -((column.length - 1) / 2), (column.length - 1) / 2);

                for (let x = 0; x < column.length; x++) {
                    const kind = column[x] as Cell;
                    const cubeEntity = createCubeEntity(`Cube-${x}-${z}`, x, z, kind);
                    const transform = cubeEntity.getComponent('Transform');
                    const target = cubeEntity.getComponent('TargetPosition');

                    transform.data.position[1] += i * 7;
                    i++;

                    target.data.position[0] = mapX(x) * 2.35;
                    target.data.position[1] = 0;
                    target.data.position[2] = mapZ(z) * 2.35;

                    world.spawnEntity(cubeEntity);

                    if (kind === PLAY) {
                        playerStart.x = x;
                        playerStart.z = z;
                        playerTarget[0] = mapX(x) * 2.35;
                        playerTarget[1] = 1.2;
                        playerTarget[2] = mapZ(z) * 2.35;

                        playerPosition[0] = mapX(x) * 2.35;
                        playerPosition[1] = 20;
                        playerPosition[2] = mapZ(z) * 2.35;
                    }
                }
            }

            setTimeout(() => {
                const player = createPlayerEntity(playerStart.x, playerStart.z);
                const target = player.getComponent('TargetPosition');
                const transform = player.getComponent('Transform');
                target.data.position = playerTarget;
                transform.data.position = playerPosition;

                world.spawnEntity(player);
                world.dispatchEvent({ type: 'PLAYER_SPAWNED', payload: player });
            }, 1000);
        }
    });
};
