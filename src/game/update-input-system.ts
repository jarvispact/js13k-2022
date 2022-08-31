import { StartupSystem } from '../ecs/system';
import { DEADLY_TILE, EMPTY_TILE, GOAL_TILE, Level, levels, SAFE_TILE } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { objectKeys } from '../utils/object-keys';
import { sleep } from '../utils/sleep';
import { PlayerEntity, TileEntity } from './entities';
import { dieSound, levelUpSound, moveSound, SoundPlayer } from './sound';
import { moveTargetWithAnimation } from './utils';
import { World } from './world';

const actionKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type Key = typeof actionKeys[number];

const isActionKey = (key: unknown): key is Key => actionKeys.includes(key as Key);

const handleNewTile = (direction: Key, playerEntity: PlayerEntity, level: Level, world: World) => {
    const playerComponent = playerEntity.getComponent('Player');
    const playerTarget = playerEntity.getComponent('TargetTransform');

    if (direction === 'ArrowDown') {
        playerComponent.data.z += 1;
        const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
        moveTargetWithAnimation(playerTarget, 2, mapZ(playerComponent.data.z) * 2.35, 2.3);
    } else if (direction === 'ArrowUp') {
        playerComponent.data.z -= 1;
        const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
        moveTargetWithAnimation(playerTarget, 2, mapZ(playerComponent.data.z) * 2.35, 2.3);
    } else if (direction === 'ArrowLeft') {
        playerComponent.data.x -= 1;
        const levelColumn = level[playerComponent.data.z] || [];

        const mapX = createMap(
            0,
            levelColumn.length - 1,
            -((levelColumn.length - 1) / 2),
            (levelColumn.length - 1) / 2,
        );

        moveTargetWithAnimation(playerTarget, 0, mapX(playerComponent.data.x) * 2.35, 2.3);
    } else if (direction === 'ArrowRight') {
        playerComponent.data.x += 1;
        const levelColumn = level[playerComponent.data.z] || [];

        const mapX = createMap(
            0,
            levelColumn.length - 1,
            -((levelColumn.length - 1) / 2),
            (levelColumn.length - 1) / 2,
        );

        moveTargetWithAnimation(playerTarget, 0, mapX(playerComponent.data.x) * 2.35, 2.3);
    }

    const newLevelColumn = level[playerComponent.data.z];

    if (!newLevelColumn) {
        world.dispatch({ type: 'RUN_DYING_ANIMATION' });
        sleep(300).then(() => {
            moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            world.dispatch({ type: 'DIE' });
        });
        return;
    }

    const newTile = newLevelColumn[playerComponent.data.x];

    if (newTile === GOAL_TILE) {
        SoundPlayer.play(levelUpSound);
        const { currentLevel } = world.getState();
        if (currentLevel === levels.length - 1) {
            world.dispatch({ type: 'COMPLETE' });
        } else {
            world.dispatch({ type: 'RUN_LEVEL_UP_ANIMATION' });
        }
    } else if (newTile === EMPTY_TILE || newTile === undefined) {
        SoundPlayer.play(dieSound);
        world.dispatch({ type: 'RUN_DYING_ANIMATION' });
        sleep(300).then(() => {
            moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            world.dispatch({ type: 'DIE' });
        });
    } else if (newTile === DEADLY_TILE) {
        SoundPlayer.play(dieSound);
        world.dispatch({ type: 'RUN_DYING_ANIMATION' });
        const tileEntity = world.getEntity<TileEntity>(`Tile-${playerComponent.data.x}-${playerComponent.data.z}`);
        const tileTarget = tileEntity.getComponent('TargetTransform');
        sleep(150).then(async () => {
            moveTargetWithAnimation(tileTarget, 1, -20, 0.1);
            await sleep(150);
            moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            world.dispatch({
                type: 'DIE',
                deadlyTile: {
                    level: world.getState().currentLevel,
                    position: { x: playerComponent.data.x, z: playerComponent.data.z },
                },
            });
        });
    } else if (newTile === SAFE_TILE) {
        SoundPlayer.play(moveSound);
    }
};

const actionMap: {
    [K in Key]: (playerEntity: PlayerEntity, level: Level, world: World) => void;
} = {
    ArrowDown: (playerEntity, level, world) => {
        handleNewTile('ArrowDown', playerEntity, level, world);
    },
    ArrowUp: (playerEntity, level, world) => {
        handleNewTile('ArrowUp', playerEntity, level, world);
    },
    ArrowLeft: (playerEntity, level, world) => {
        handleNewTile('ArrowLeft', playerEntity, level, world);
    },
    ArrowRight: (playerEntity, level, world) => {
        handleNewTile('ArrowRight', playerEntity, level, world);
    },
};

const flashArrowButton = (btn: HTMLButtonElement) => {
    btn.style.borderColor = 'green';
    sleep(150).then(() => {
        btn.style.borderColor = 'transparent';
    });
};

export const inputSystem: StartupSystem<World> = (world) => {
    world.onStateChange(({ action }) => {
        if (action.type === 'START') {
            const playerEntity = world.getEntity<PlayerEntity>('Player');

            const buttons: { [K in Key]: HTMLButtonElement } = {
                ArrowUp: document.getElementById('up') as HTMLButtonElement,
                ArrowLeft: document.getElementById('left') as HTMLButtonElement,
                ArrowRight: document.getElementById('right') as HTMLButtonElement,
                ArrowDown: document.getElementById('down') as HTMLButtonElement,
            };

            document.addEventListener('keyup', (e) => {
                if (!isActionKey(e.key)) return;
                const { currentLevel, status } = world.getState();
                const level = levels[currentLevel];
                if (status !== 'running') return;
                flashArrowButton(buttons[e.key]);
                actionMap[e.key](playerEntity, level, world);
            });

            objectKeys(buttons).forEach((key) => {
                buttons[key].addEventListener('click', () => {
                    const { currentLevel, status } = world.getState();
                    const level = levels[currentLevel];
                    if (status !== 'running') return;
                    flashArrowButton(buttons[key]);
                    handleNewTile(key, playerEntity, level, world);
                });
            });
        }
    });
};
