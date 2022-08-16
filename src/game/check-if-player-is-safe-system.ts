import { System } from '../ecs/system';
import { has, World } from '../ecs/world';
import { DEAD, GOAL } from '../resources/levels';
import { CubeType, PlayerType } from './components';
import { CubeEntity, PlayerEntity } from './entities';
import { WorldState } from './world';

export const createCheckIfPlayerIsSafeSystem = (world: World<WorldState>): System => {
    const cubeEntities = world.createQuery(has(CubeType)).entities as CubeEntity[];
    const playerEntities = world.createQuery(has(PlayerType)).entities as PlayerEntity[];

    return () => {
        const player = playerEntities[0].getComponent('Player');

        for (let i = 0; i < cubeEntities.length; i++) {
            const cube = cubeEntities[i].getComponent('Cube');
            if (cube.data.x === player.data.x && cube.data.z === player.data.z) {
                if (cube.data.kind === DEAD) {
                    world.state.status = 'game-over';
                } else if (cube.data.kind === GOAL) {
                    world.state.status = 'level-clear';
                }
            }
        }
    };
};
