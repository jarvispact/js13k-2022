import { StartupSystem } from '../ecs/system';
import { DEADLY_TILE, EMPTY_TILE, GOAL_TILE, Level, SAFE_TILE } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { sleep } from '../utils/sleep';
import { PlayerComponent, TargetPositionComponent } from './components';
import { PlayerEntity, TileEntity } from './entities';
import { dieSound, levelUpSound, moveSound, SoundPlayer } from './sound';
import { moveTargetWithAnimation } from './utils';
import { World } from './world';

const actionKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type Key = typeof actionKeys[number];

const isActionKey = (key: unknown): key is Key => actionKeys.includes(key as Key);

const handleNewTile = (
    level: Level,
    playerComponent: PlayerComponent,
    playerTarget: TargetPositionComponent,
    world: World,
) => {
    const newLevelColumn = level[playerComponent.data.z];

    if (!newLevelColumn) {
        world.dispatch({ type: 'RUN_FALLING_ANIMATION' });
        sleep(300).then(() => {
            moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            world.dispatch({ type: 'GAME_OVER' });
        });
    }

    const newTile = newLevelColumn[playerComponent.data.x];

    if (newTile === GOAL_TILE) {
        SoundPlayer.play(levelUpSound);
        const { levels, currentLevel } = world.getState();
        if (currentLevel === levels.length - 1) {
            world.dispatch({ type: 'COMPLETE' });
        } else {
            world.dispatch({ type: 'RUN_LEVEL_UP_ANIMATION' });
        }
    } else if (newTile === EMPTY_TILE) {
        SoundPlayer.play(dieSound);
        world.dispatch({ type: 'RUN_FALLING_ANIMATION' });
        sleep(300).then(() => {
            moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            world.dispatch({ type: 'GAME_OVER' });
        });
    } else if (newTile === DEADLY_TILE) {
        SoundPlayer.play(dieSound);
        world.dispatch({ type: 'RUN_FALLING_ANIMATION' });
        const tileEntity = world.getEntity<TileEntity>(`Tile-${playerComponent.data.x}-${playerComponent.data.z}`);
        const tileTarget = tileEntity.getComponent('TargetTransform');
        sleep(150).then(async () => {
            moveTargetWithAnimation(tileTarget, 1, -20, 0.1);

            await sleep(150);

            moveTargetWithAnimation(playerTarget, 1, -20, 0.1);
            world.dispatch({ type: 'GAME_OVER' });
        });
    } else if (newTile === SAFE_TILE) {
        SoundPlayer.play(moveSound);
    }
};

const actionMap: {
    [K in Key]: (playerEntity: PlayerEntity, level: Level, world: World) => void;
} = {
    ArrowDown: (playerEntity, level, world) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        playerComponent.data.z += 1;

        const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
        moveTargetWithAnimation(playerTarget, 2, mapZ(playerComponent.data.z) * 2.35, 1.5);
        handleNewTile(level, playerComponent, playerTarget, world);
    },
    ArrowUp: (playerEntity, level, world) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        playerComponent.data.z -= 1;

        const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);
        moveTargetWithAnimation(playerTarget, 2, mapZ(playerComponent.data.z) * 2.35, 1.5);
        handleNewTile(level, playerComponent, playerTarget, world);
    },
    ArrowLeft: (playerEntity, level, world) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        playerComponent.data.x -= 1;

        const levelColumn = level[playerComponent.data.z] || [];

        const mapX = createMap(
            0,
            levelColumn.length - 1,
            -((levelColumn.length - 1) / 2),
            (levelColumn.length - 1) / 2,
        );

        moveTargetWithAnimation(playerTarget, 0, mapX(playerComponent.data.x) * 2.35, 1.5);
        handleNewTile(level, playerComponent, playerTarget, world);
    },
    ArrowRight: (playerEntity, level, world) => {
        const playerComponent = playerEntity.getComponent('Player');
        const playerTarget = playerEntity.getComponent('TargetTransform');

        playerComponent.data.x += 1;

        const levelColumn = level[playerComponent.data.z] || [];

        const mapX = createMap(
            0,
            levelColumn.length - 1,
            -((levelColumn.length - 1) / 2),
            (levelColumn.length - 1) / 2,
        );

        moveTargetWithAnimation(playerTarget, 0, mapX(playerComponent.data.x) * 2.35, 1.5);
        handleNewTile(level, playerComponent, playerTarget, world);
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
