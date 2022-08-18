import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { Cell, DEAD, GOAL, SAFE } from '../resources/levels';
import { PlayerComponent } from './components';
import { WorldAction, WorldEvent, WorldState } from './world';

const actionKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type Key = typeof actionKeys[number];

const isActionKey = (key: unknown): key is Key => actionKeys.includes(key as Key);

type Boundary = { min: number; max: number };
type Boundaries = { x: Boundary; z: Boundary };

export const inputSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    const updateWorld = (playerComponent: PlayerComponent, level: Cell[][]) => {
        const kind = level[playerComponent.data.z][playerComponent.data.x];
        if (kind === SAFE) {
            world.dispatch({ type: 'INCREMENT_SCORE' });
        } else if (kind === DEAD) {
            world.dispatch({ type: 'GAME_OVER' });
        } else if (kind === GOAL) {
            world.dispatch({ type: 'LEVEL_UP' });
        }
    };

    const actionMap: {
        [K in Key]: (playerComponent: PlayerComponent, boundaries: Boundaries, level: Cell[][]) => void;
    } = {
        ArrowDown: (playerComponent, boundaries, level) => {
            if (playerComponent.data.z >= boundaries.z.max) return;
            playerComponent.data.z += 1;
            updateWorld(playerComponent, level);
        },
        ArrowUp: (playerComponent, boundaries, level) => {
            if (playerComponent.data.z <= boundaries.z.min) return;
            playerComponent.data.z -= 1;
            updateWorld(playerComponent, level);
        },
        ArrowLeft: (playerComponent, boundaries, level) => {
            if (playerComponent.data.x <= boundaries.x.min) return;
            playerComponent.data.x -= 1;
            updateWorld(playerComponent, level);
        },
        ArrowRight: (playerComponent, boundaries, level) => {
            if (playerComponent.data.x >= boundaries.x.max) return;
            playerComponent.data.x += 1;
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
            boundaries.x = { min: 0, max: levels[currentLevel].data[0].length - 1 };
            boundaries.z = { min: 0, max: levels[currentLevel].data.length - 1 };
        }
    });

    world.onEvent((event) => {
        if (event.type === 'PLAYER_SPAWNED') {
            document.addEventListener('keyup', (e) => {
                if (!isActionKey(e.key)) return;
                const { levels, currentLevel } = world.getState();
                const playerComponent = event.payload.getComponent('Player');
                actionMap[e.key](playerComponent, boundaries, levels[currentLevel].data);
            });
        }
    });
};
