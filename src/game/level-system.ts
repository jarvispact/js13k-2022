import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { PLAY } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { TileEntity, PlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

export const levelSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    world.onStateChange(({ action, newState }) => {
        if (action.type === 'LEVEL_UP' || action.type === 'GAME_OVER') {
            const playerEntity = world.getEntity<PlayerEntity>('Player');
            const player = playerEntity.getComponent('Player');
            const target = playerEntity.getComponent('TargetPosition');
            const level = newState.levels[newState.currentLevel];

            const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

            for (let z = 0; z < level.length; z++) {
                const column = level[z];
                const mapX = createMap(0, column.length - 1, -((column.length - 1) / 2), (column.length - 1) / 2);

                for (let x = 0; x < column.length; x++) {
                    const cell = column[x];

                    const cubeEntity = world.getEntity<TileEntity>(`Cube-${x}-${z}`);
                    const cube = cubeEntity.getComponent('Cube');
                    cube.data.x = x;
                    cube.data.z = z;
                    cube.data.kind = cell;

                    const t = cubeEntity.getComponent('TargetPosition');

                    t.data.position[0] = mapX(x) * 2.35;
                    t.data.position[1] = 0;
                    t.data.position[2] = mapZ(z) * 2.35;

                    if (cell === PLAY) {
                        player.data.x = x;
                        player.data.z = z;
                        target.data.position[0] = mapX(x) * 2.35;
                        target.data.position[2] = mapZ(z) * 2.35;
                    }
                }
            }
        }
    });
};
