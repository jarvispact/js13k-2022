import { World as EcsWorld } from '../ecs/world';

type Status = 'paused' | 'animating' | 'running' | 'dead' | 'completed';

export type WorldState = {
    status: Status;
    currentLevel: number;
    deathCounter: number;
    sound: boolean;
    discoveredDeadlyTilesPerLevel: Record<number, { x: number; z: number }[]>;
};

export type WorldAction =
    | { type: 'SET_SOUND'; sound: boolean }
    | { type: 'RUN_START_ANIMATION' }
    | { type: 'START' }
    | { type: 'RUN_DYING_ANIMATION' }
    | { type: 'DIE'; deadlyTile?: { level: number; position: { x: number; z: number } } }
    | { type: 'RUN_LEVEL_UP_ANIMATION' }
    | { type: 'LEVEL_UP' }
    | { type: 'COMPLETE' }
    | {
          type: 'RUN_RE_START_ANIMATION';
          level: number;
          deaths: number;
          discoveredDeadlyTilesPerLevel: Record<number, { x: number; z: number }[]>;
      }
    | { type: 'RE_START' };

export const world = new EcsWorld<WorldState, WorldAction>({
    initialState: {
        status: 'paused',
        currentLevel: 0,
        deathCounter: 0,
        sound: true,
        discoveredDeadlyTilesPerLevel: {},
    },
    stateReducer: (state, action) => {
        switch (action.type) {
            case 'SET_SOUND':
                return { ...state, sound: action.sound };
            case 'RUN_START_ANIMATION':
                return { ...state, status: 'animating' };
            case 'START':
                return {
                    ...state,
                    status: 'running',
                    currentLevel: 0,
                    deathCounter: 0,
                    discoveredDeadlyTilesPerLevel: {},
                };
            case 'RUN_DYING_ANIMATION':
                return { ...state, status: 'animating' };
            case 'DIE':
                return {
                    ...state,
                    status: 'dead',
                    deathCounter: state.deathCounter + 1,
                    discoveredDeadlyTilesPerLevel: action.deadlyTile
                        ? {
                              ...state.discoveredDeadlyTilesPerLevel,
                              [action.deadlyTile.level]: state.discoveredDeadlyTilesPerLevel[action.deadlyTile.level]
                                  ? [
                                        ...state.discoveredDeadlyTilesPerLevel[action.deadlyTile.level],
                                        action.deadlyTile.position,
                                    ]
                                  : [action.deadlyTile.position],
                          }
                        : state.discoveredDeadlyTilesPerLevel,
                };
            case 'RUN_LEVEL_UP_ANIMATION':
                return { ...state, status: 'animating', currentLevel: state.currentLevel + 1 };
            case 'LEVEL_UP':
                return { ...state, status: 'running' };
            case 'COMPLETE':
                return { ...state, status: 'completed' };
            case 'RUN_RE_START_ANIMATION':
                return {
                    ...state,
                    status: 'animating',
                    currentLevel: action.level,
                    deathCounter: action.deaths,
                    discoveredDeadlyTilesPerLevel: action.discoveredDeadlyTilesPerLevel,
                };
            case 'RE_START':
                return { ...state, status: 'running' };
            default:
                return state;
        }
    },
});

export type World = typeof world;
