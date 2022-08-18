import { World } from '../ecs/world';
import { Level, levels } from '../resources/levels';
import { PlayerEntity } from './entities';

type Status = 'idle' | 'running' | 'game-over';

export type WorldState = { status: Status; levels: Level[]; currentLevel: number; score: number };

export type WorldAction =
    | { type: 'START' }
    | { type: 'GAME_OVER' }
    | { type: 'LEVEL_UP' }
    | { type: 'INCREMENT_SCORE' };

export type WorldEvent = { type: 'PLAYER_SPAWNED'; payload: PlayerEntity };

export const world = new World<WorldState, WorldAction, WorldEvent>({
    initialState: { status: 'idle', levels, currentLevel: 0, score: 0 },
    stateReducer: (state, action) => {
        switch (action.type) {
            case 'START':
                return { ...state, status: 'running' };
            case 'GAME_OVER':
                return { ...state, status: 'game-over' };
            case 'LEVEL_UP':
                return { ...state, currentLevel: state.currentLevel + 1 };
            case 'INCREMENT_SCORE':
                return { ...state, score: state.score + 1 };
            default:
                return state;
        }
    },
});
