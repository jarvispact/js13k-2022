export const DEAD = 0;
export const SAFE = 1;

export type CubeKind = typeof DEAD | typeof SAFE;

const level1 = [
    [DEAD, SAFE, DEAD],
    [SAFE, DEAD, DEAD],
    [SAFE, DEAD, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, DEAD, SAFE],
];

const level2 = [
    [SAFE, DEAD, DEAD],
    [SAFE, DEAD, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, SAFE, DEAD],
    [DEAD, DEAD, SAFE],
];

export const levels = {
    level1,
    level2,
};
