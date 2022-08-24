import { World as EcsWorld } from '../ecs/world';
import { Level, levels } from '../resources/levels';

type Status = 'paused' | 'start-animation' | 'level-up-animation' | 'running' | 'game-over' | 'completed';

export type WorldState = { status: Status; levels: Level[]; currentLevel: number };

export type WorldAction =
    | { type: 'RUN_START_ANIMATION' }
    | { type: 'START' }
    | { type: 'GAME_OVER' }
    | { type: 'RUN_LEVEL_UP_ANIMATION' }
    | { type: 'LEVEL_UP' }
    | { type: 'COMPLETE' };

export const world = new EcsWorld<WorldState, WorldAction>({
    initialState: { status: 'paused', levels, currentLevel: 0 },
    stateReducer: (state, action) => {
        switch (action.type) {
            case 'RUN_START_ANIMATION':
                return { ...state, status: 'start-animation' };
            case 'START':
                return { ...state, status: 'running', currentLevel: 0 };
            case 'GAME_OVER':
                return { ...state, status: 'game-over' };
            case 'RUN_LEVEL_UP_ANIMATION':
                return { ...state, status: 'level-up-animation', currentLevel: state.currentLevel + 1 };
            case 'LEVEL_UP':
                return { ...state, status: 'running' };
            case 'COMPLETE':
                return { ...state, status: 'completed' };
            default:
                return state;
        }
    },
});

export type World = typeof world;
