import { System } from '../ecs/system';
import { has, World } from '../ecs/world';
import { Cell, DEAD } from '../resources/levels';
import { TileType, PlayerType } from './components';
import { TileEntity, PlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

const setupRows = (rows: string[][], level: Cell[][]) => {
    rows.length = 0;

    for (let z = 0; z < level.length; z++) {
        const column = level[z];
        rows[z] = [];

        for (let x = 0; x < column.length; x++) {
            rows[z][x] = `[${DEAD}]`;
        }
    }
};

export const createRenderSystem = (world: World<WorldState, WorldAction, WorldEvent>): System => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cubeEntities = world.createQuery(has(TileType)).entities as TileEntity[];
    const playerEntities = world.createQuery(has(PlayerType)).entities as PlayerEntity[];

    const rows: string[][] = [];
    const state = world.getState();
    setupRows(rows, state.levels[state.currentLevel]);

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'LEVEL_UP' || action.type === 'GAME_OVER') {
            setupRows(rows, newState.levels[newState.currentLevel]);
        }
    });

    let timeToRender = Date.now() + 1000;

    return () => {
        const { currentLevel, status } = world.getState();

        if (status === 'idle') {
            console.log('Idle');
            return;
        }

        if (status === 'game-over') {
            console.log('Game Over');
            return;
        }

        if (status === 'completed') {
            console.log('Complete!');
            return;
        }

        if (Date.now() > timeToRender) {
            const player = playerEntities[0].getComponent(PlayerType);

            console.clear();
            console.log(`Level: ${currentLevel}`);

            // set correct entries for new level
            for (let i = 0; i < cubeEntities.length; i++) {
                const cube = cubeEntities[i].getComponent('Cube');
                rows[cube.data.z][cube.data.x] = `[${cube.data.kind}]`;

                if (player.data.z === cube.data.z && player.data.x === cube.data.x) {
                    rows[cube.data.z][cube.data.x] = `[P]`;
                }
            }

            console.log(rows.map((r) => `${r.join('')}\n`).join(''));
            timeToRender = Date.now() + 1000;
        }
    };
};
