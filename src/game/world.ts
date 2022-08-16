import { World } from '../ecs/world';
import { Level, levels } from '../resources/levels';

type Status = 'idle' | 'running' | 'paused' | 'game-over' | 'level-clear';

export type WorldState = { status: Status; levels: Level[]; currentLevel: number };

export const world = new World<WorldState>({ status: 'idle', levels, currentLevel: 0 });
