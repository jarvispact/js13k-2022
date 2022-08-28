import { World as EcsWorld } from '../ecs/world';

type Status = 'paused' | 'animating' | 'running' | 'game-over' | 'completed';

export type WorldState = { status: Status; currentLevel: number };

export type WorldAction =
    | { type: 'RUN_START_ANIMATION' }
    | { type: 'START' }
    | { type: 'RUN_FALLING_ANIMATION' }
    | { type: 'GAME_OVER' }
    | { type: 'RUN_LEVEL_UP_ANIMATION' }
    | { type: 'LEVEL_UP' }
    | { type: 'COMPLETE' }
    | { type: 'RE_START' };

export const world = new EcsWorld<WorldState, WorldAction>({
    initialState: { status: 'paused', currentLevel: 0 },
    stateReducer: (state, action) => {
        switch (action.type) {
            case 'RUN_START_ANIMATION':
                return { ...state, status: 'animating' };
            case 'START':
                return { ...state, status: 'running', currentLevel: 0 };
            case 'RUN_FALLING_ANIMATION':
                return { ...state, status: 'animating' };
            case 'GAME_OVER':
                return { ...state, status: 'game-over' };
            case 'RUN_LEVEL_UP_ANIMATION':
                return { ...state, status: 'animating', currentLevel: state.currentLevel + 1 };
            case 'LEVEL_UP':
                return { ...state, status: 'running' };
            case 'COMPLETE':
                return { ...state, status: 'completed' };
            case 'RE_START':
                return { ...state, status: 'running', currentLevel: 0 };
            default:
                return state;
        }
    },
});

export type World = typeof world;
