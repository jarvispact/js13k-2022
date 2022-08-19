import { vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { Cell, PLAY } from '../resources/levels';
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

    const playerStart: { x: number; z: number } = { x: 0, z: 0 };

    for (let z = 0; z < level.length; z++) {
        const column = level[z];
        for (let x = 0; x < column.length; x++) {
            const kind = column[x] as Cell;
            world.spawnEntity(createCubeEntity(`Cube-${x}-${z}`, x, z, kind));
            if (kind === PLAY) {
                playerStart.x = x;
                playerStart.z = z;
            }
        }
    }

    const player = createPlayerEntity(playerStart.x, playerStart.z);
    world.spawnEntity(player);
    world.dispatchEvent({ type: 'PLAYER_SPAWNED', payload: player });

    world.onStateChange(({ action, newState }) => {
        if (action.type == 'LEVEL_UP' || action.type === 'GAME_OVER') {
            for (let z = 0; z < newState.levels[newState.currentLevel].length; z++) {
                const column = newState.levels[newState.currentLevel][z];
                for (let x = 0; x < column.length; x++) {
                    const kind = column[x] as Cell;
                    if (kind === PLAY) {
                        const playerComponent = player.getComponent('Player');
                        playerComponent.data.x = x;
                        playerComponent.data.z = z;
                    }
                }
            }
        }
    });
};
