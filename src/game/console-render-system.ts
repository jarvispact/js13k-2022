import { System } from '../ecs/system';
import { has, World } from '../ecs/world';
import { DEAD } from '../resources/levels';
import { CubeType, PlayerType } from './components';
import { CubeEntity, PlayerEntity } from './entities';
import { WorldState } from './world';

export const createRenderSystem = (world: World<WorldState>): System => {
    const { levels, currentLevel } = world.state;

    const cubeEntities = world.createQuery(has(CubeType)).entities as CubeEntity[];
    const playerEntities = world.createQuery(has(PlayerType)).entities as PlayerEntity[];

    let timeToRender = Date.now() + 100;

    const rows: string[][] = [];
    for (let z = 0; z < levels[currentLevel].data.length; z++) {
        const column = levels[currentLevel].data[z];
        rows.push([...new Array(column.length)].map(() => `[${DEAD}]`));
    }

    return () => {
        const player = playerEntities[0].getComponent(PlayerType);

        if (Date.now() > timeToRender) {
            if (world.state.status === 'game-over') {
                console.log('Game Over');
                return;
            }

            if (world.state.status === 'level-clear') {
                console.log('Level clear');
                return;
            }

            console.clear();

            for (let i = 0; i < cubeEntities.length; i++) {
                const cubeEntity = cubeEntities[i];
                const cube = cubeEntity.getComponent('Cube');
                rows[cube.data.z][cube.data.x] = `[${cube.data.kind}]`;

                if (player.data.z === cube.data.z && player.data.x === cube.data.x) {
                    rows[cube.data.z][cube.data.x] = `[P]`;
                }
            }

            console.log(rows.map((r) => `${r.join('')}\n`).join(''));
            timeToRender = Date.now() + 100;
        }
    };
};
