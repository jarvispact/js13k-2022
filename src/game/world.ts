import { World } from '../ecs/world';
import { levels } from '../resources/levels';

export type WorldState = { paused: boolean; currentLevel: number[][] };

export const world = new World<WorldState>({ paused: true, currentLevel: levels.level1 });
