export const DEAD = 0;
export const SAFE = 1;
export const GOAL = 2;

export type CubeKind = typeof DEAD | typeof SAFE | typeof GOAL;

const level1 = [
    [SAFE, GOAL, DEAD],
    [SAFE, DEAD, DEAD],
    [SAFE, SAFE, DEAD],
    [DEAD, SAFE, SAFE],
    [DEAD, DEAD, SAFE],
];

const level2 = [
    [GOAL, DEAD, DEAD],
    [SAFE, DEAD, DEAD],
    [SAFE, SAFE, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, SAFE, DEAD],
];

export type Level = {
    data: number[][];
    playerStart: { x: number; z: number };
};

export const levels: Level[] = [
    { data: level1, playerStart: { x: 2, z: level1.length - 1 } },
    { data: level2, playerStart: { x: 1, z: level2.length - 1 } },
];
