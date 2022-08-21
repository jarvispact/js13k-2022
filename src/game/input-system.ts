import { mat4 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { Cell, DEAD, GOAL, Level, SAFE } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { PlayerComponent, TransformComponent } from './components';
import { PlayerEntity } from './entities';
import { WorldAction, WorldEvent, WorldState } from './world';

const actionKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type Key = typeof actionKeys[number];

const isActionKey = (key: unknown): key is Key => actionKeys.includes(key as Key);

type Boundary = { min: number; max: number };
type Boundaries = { x: Boundary; z: Boundary };

const updatePlayerTransform = (t: TransformComponent, playerComponent: PlayerComponent, level: Level) => {
    const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

    const mapXForZ = (z: number) =>
        createMap(0, level[z].length - 1, -((level[z].length - 1) / 2), (level[z].length - 1) / 2);

    t.data.position[0] = mapXForZ(playerComponent.data.z)(playerComponent.data.x) * 2.35;
    t.data.position[2] = mapZ(playerComponent.data.z) * 2.35;

    mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.rotation, t.data.position, t.data.scale);
};

export const inputSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    const updateWorld = (playerComponent: PlayerComponent, level: Cell[][]) => {
        const kind = level[playerComponent.data.z][playerComponent.data.x];
        if (kind === SAFE) {
            world.dispatch({ type: 'INCREMENT_SCORE' });
        } else if (kind === DEAD) {
            world.dispatch({ type: 'GAME_OVER' });
        } else if (kind === GOAL) {
            const { levels, currentLevel } = world.getState();
            if (currentLevel === levels.length - 1) {
                world.dispatch({ type: 'COMPLETE' });
            } else {
                world.dispatch({ type: 'LEVEL_UP' });
            }
        }
    };

    const actionMap: {
        [K in Key]: (playerEntity: PlayerEntity, boundaries: Boundaries, level: Level) => void;
    } = {
        ArrowDown: (playerEntity, boundaries, level) => {
            const playerComponent = playerEntity.getComponent('Player');
            const transformComponent = playerEntity.getComponent('Transform');
            if (playerComponent.data.z >= boundaries.z.max) return;
            playerComponent.data.z += 1;
            updatePlayerTransform(transformComponent, playerComponent, level);
            updateWorld(playerComponent, level);
        },
        ArrowUp: (playerEntity, boundaries, level) => {
            const playerComponent = playerEntity.getComponent('Player');
            const transformComponent = playerEntity.getComponent('Transform');
            if (playerComponent.data.z <= boundaries.z.min) return;
            playerComponent.data.z -= 1;
            updatePlayerTransform(transformComponent, playerComponent, level);
            updateWorld(playerComponent, level);
        },
        ArrowLeft: (playerEntity, boundaries, level) => {
            const playerComponent = playerEntity.getComponent('Player');
            const transformComponent = playerEntity.getComponent('Transform');
            if (playerComponent.data.x <= boundaries.x.min) return;
            playerComponent.data.x -= 1;
            updatePlayerTransform(transformComponent, playerComponent, level);
            updateWorld(playerComponent, level);
        },
        ArrowRight: (playerEntity, boundaries, level) => {
            const playerComponent = playerEntity.getComponent('Player');
            const transformComponent = playerEntity.getComponent('Transform');
            if (playerComponent.data.x >= boundaries.x.max) return;
            playerComponent.data.x += 1;
            updatePlayerTransform(transformComponent, playerComponent, level);
            updateWorld(playerComponent, level);
        },
    };

    const boundaries: Boundaries = {
        x: { min: 0, max: 0 },
        z: { min: 0, max: 0 },
    };

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'START' || action.type == 'LEVEL_UP' || action.type === 'GAME_OVER') {
            const { levels, currentLevel } = newState;
            // assuming that all columns within 1 level have the same size
            boundaries.x = { min: 0, max: levels[currentLevel][0].length - 1 };
            boundaries.z = { min: 0, max: levels[currentLevel].length - 1 };
        }
    });

    world.onEvent((event) => {
        if (event.type === 'PLAYER_SPAWNED') {
            document.addEventListener('keyup', (e) => {
                if (!isActionKey(e.key)) return;
                const { levels, currentLevel, status } = world.getState();
                if (status !== 'running') return;
                actionMap[e.key](event.payload, boundaries, levels[currentLevel]);
            });
        }
    });
};
