export const DEAD = 0;
export const SAFE = 1;
export const GOAL = 2;
export const PLAY = 3;

export type Cell = typeof DEAD | typeof SAFE | typeof GOAL | typeof PLAY;
export type Level = Cell[][];

const level1: Cell[][] = [
    [SAFE, GOAL, DEAD],
    [SAFE, DEAD, DEAD],
    [SAFE, SAFE, DEAD],
    [DEAD, SAFE, SAFE],
    [DEAD, DEAD, PLAY],
];

const level2: Cell[][] = [
    [GOAL, DEAD, DEAD],
    [SAFE, DEAD, DEAD],
    [SAFE, SAFE, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, PLAY, DEAD],
];

const level3: Cell[][] = [
    [DEAD, SAFE, GOAL],
    [DEAD, SAFE, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, PLAY, DEAD],
];

export const levels: Level[] = [level1, level2, level3];
