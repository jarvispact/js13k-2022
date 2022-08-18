import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { PLAY } from '../resources/levels';
import { CubeEntity, PlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

export const levelSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    world.onStateChange(({ action, newState }) => {
        if (action.type === 'LEVEL_UP' || action.type === 'GAME_OVER') {
            const player = world.getEntity<PlayerEntity>('Player').getComponent('Player');
            const levelData = newState.levels[newState.currentLevel].data;

            for (let z = 0; z < levelData.length; z++) {
                const column = levelData[z];

                for (let x = 0; x < column.length; x++) {
                    const cell = column[x];

                    const cube = world.getEntity<CubeEntity>(`Cube-${x}-${z}`).getComponent('Cube');
                    cube.data.x = x;
                    cube.data.z = z;
                    cube.data.kind = cell;

                    if (cell === PLAY) {
                        player.data.x = x;
                        player.data.z = z;
                    }
                }
            }
        }
    });
};
