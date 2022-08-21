import { mat4 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { PLAY } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { CubeEntity, PlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

export const levelSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    world.onStateChange(({ action, newState }) => {
        if (action.type === 'LEVEL_UP' || action.type === 'GAME_OVER') {
            const playerEntity = world.getEntity<PlayerEntity>('Player');
            const player = playerEntity.getComponent('Player');
            const transform = playerEntity.getComponent('Transform');
            const level = newState.levels[newState.currentLevel];

            const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

            for (let z = 0; z < level.length; z++) {
                const column = level[z];
                const mapX = createMap(0, column.length - 1, -((column.length - 1) / 2), (column.length - 1) / 2);

                for (let x = 0; x < column.length; x++) {
                    const cell = column[x];

                    const cubeEntity = world.getEntity<CubeEntity>(`Cube-${x}-${z}`);
                    const cube = cubeEntity.getComponent('Cube');
                    cube.data.x = x;
                    cube.data.z = z;
                    cube.data.kind = cell;

                    const t = cubeEntity.getComponent('Transform');

                    t.data.position[0] = mapX(x) * 2.35;
                    t.data.position[1] = 0;
                    t.data.position[2] = mapZ(z) * 2.35;

                    mat4.fromRotationTranslationScale(
                        t.data.modelMatrix,
                        t.data.rotation,
                        t.data.position,
                        t.data.scale,
                    );

                    if (cell === PLAY) {
                        player.data.x = x;
                        player.data.z = z;
                        transform.data.position[0] = mapX(x) * 2.35;
                        transform.data.position[2] = mapZ(z) * 2.35;

                        mat4.fromRotationTranslationScale(
                            transform.data.modelMatrix,
                            transform.data.rotation,
                            transform.data.position,
                            transform.data.scale,
                        );
                    }
                }
            }
        }
    });
};
