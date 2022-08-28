import { World as EcsWorld } from '../ecs/world';

type Status = 'paused' | 'animating' | 'running' | 'dead' | 'completed';

export type WorldState = { status: Status; currentLevel: number; deathCounter: number };

export type WorldAction =
    | { type: 'RUN_START_ANIMATION' }
    | { type: 'START' }
    | { type: 'RUN_DYING_ANIMATION' }
    | { type: 'DIE' }
    | { type: 'RUN_LEVEL_UP_ANIMATION' }
    | { type: 'LEVEL_UP' }
    | { type: 'COMPLETE' }
    | { type: 'RUN_RE_START_ANIMATION'; level: number; deaths: number }
    | { type: 'RE_START' };

export const world = new EcsWorld<WorldState, WorldAction>({
    initialState: { status: 'paused', currentLevel: 0, deathCounter: 0 },
    stateReducer: (state, action) => {
        switch (action.type) {
            case 'RUN_START_ANIMATION':
                return { ...state, status: 'animating' };
            case 'START':
                return { ...state, status: 'running', currentLevel: 0, deathCounter: 0 };
            case 'RUN_DYING_ANIMATION':
                return { ...state, status: 'animating' };
            case 'DIE':
                return { ...state, status: 'dead', deathCounter: state.deathCounter + 1 };
            case 'RUN_LEVEL_UP_ANIMATION':
                return { ...state, status: 'animating', currentLevel: state.currentLevel + 1 };
            case 'LEVEL_UP':
                return { ...state, status: 'running' };
            case 'COMPLETE':
                return { ...state, status: 'completed' };
            case 'RUN_RE_START_ANIMATION':
                return { ...state, status: 'animating', currentLevel: action.level, deathCounter: action.deaths };
            case 'RE_START':
                return { ...state, status: 'running' };
            default:
                return state;
        }
    },
});

export type World = typeof world;
