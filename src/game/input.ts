import { StartupSystem } from '../ecs/system';
import { DEADLY_TILE, EMPTY_TILE, GOAL_TILE, Level } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { sleep } from '../utils/sleep';
import { PlayerEntity, TileEntity } from './entities';
import { moveTargetWithAnimation } from './utils';
import { world, World } from './world';

const actionKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type Key = typeof actionKeys[number];

const isActionKey = (key: unknown): key is Key => actionKeys.includes(key as Key);

const actionMap: {
    [K in Key]: (playerEntity: PlayerEntity, level: Level, world: World) => void;
} = {
    ArrowDown: (playerEntity, level) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        const levelColumn = level[playerComponent.data.z + 1];

        if (!levelColumn) {
            console.log('no column');
            return;
        }

        playerComponent.data.z += 1;

        const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
        moveTargetWithAnimation(playerTarget, 2, mapZ(playerComponent.data.z) * 2.35, 0.8);
    },
    ArrowUp: (playerEntity, level) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        const levelColumn = level[playerComponent.data.z - 1];

        if (!levelColumn) {
            console.log('no column');
            return;
        }

        playerComponent.data.z -= 1;

        const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
        moveTargetWithAnimation(playerTarget, 2, mapZ(playerComponent.data.z) * 2.35, 0.8);

        const tile = levelColumn[playerComponent.data.x];
        if (tile === GOAL_TILE) {
            world.dispatch({ type: 'RUN_LEVEL_UP_ANIMATION' });
        }
    },
    ArrowLeft: (playerEntity, level, world) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        const levelColumn = level[playerComponent.data.z];
        if (!levelColumn) {
            console.log('no column');
            return;
        }

        const tile = levelColumn[playerComponent.data.x - 1];
        if (tile === undefined) {
            console.log('no tile');
            return;
        }

        playerComponent.data.x -= 1;

        const mapX = createMap(
            0,
            levelColumn.length - 1,
            -((levelColumn.length - 1) / 2),
            (levelColumn.length - 1) / 2,
        );

        moveTargetWithAnimation(playerTarget, 0, mapX(playerComponent.data.x) * 2.35, 0.8);

        if (tile === DEADLY_TILE) {
            sleep(100).then(async () => {
                const tile = world.getEntity<TileEntity>(`Tile-${playerComponent.data.x}-${playerComponent.data.z}`);
                const tileTarget = tile.getComponent('TargetTransform');
                moveTargetWithAnimation(tileTarget, 1, -20, 0.1);

                await sleep(50);

                moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            });
        } else if (tile === EMPTY_TILE) {
            sleep(150).then(() => {
                moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            });
        }
    },
    ArrowRight: (playerEntity, level, world) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        const levelColumn = level[playerComponent.data.z];
        if (!levelColumn) {
            console.log('no column');
            return;
        }

        const tile = levelColumn[playerComponent.data.x + 1];
        if (tile === undefined) {
            console.log('no tile');
            return;
        }

        playerComponent.data.x += 1;

        const mapX = createMap(
            0,
            level[playerComponent.data.z].length - 1,
            -((level[playerComponent.data.z].length - 1) / 2),
            (level[playerComponent.data.z].length - 1) / 2,
        );

        moveTargetWithAnimation(playerTarget, 0, mapX(playerComponent.data.x) * 2.35, 0.8);

        if (tile === DEADLY_TILE) {
            sleep(100).then(async () => {
                const tile = world.getEntity<TileEntity>(`Tile-${playerComponent.data.x}-${playerComponent.data.z}`);
                const tileTarget = tile.getComponent('TargetTransform');
                moveTargetWithAnimation(tileTarget, 1, -20, 0.1);

                await sleep(50).then(() => {
                    moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
                });
            });
        } else if (tile === EMPTY_TILE) {
            sleep(150).then(() => {
                moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            });
        }
    },
};

export const inputSystem: StartupSystem<World> = (world) => {
    world.onStateChange(({ action }) => {
        if (action.type === 'START') {
            const playerEntity = world.getEntity<PlayerEntity>('Player');

            document.addEventListener('keyup', (e) => {
                if (!isActionKey(e.key)) return;
                const { levels, currentLevel, status } = world.getState();
                const level = levels[currentLevel];
                if (status !== 'running') return;
                actionMap[e.key](playerEntity, level, world);
            });
        }
    });
};
