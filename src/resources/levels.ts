const E = 0;
const D = 1;
const S = 2;
const G = 3;
const P = 4;

export const EMPTY_TILE = E;
export const DEADLY_TILE = D;
export const SAFE_TILE = S;
export const GOAL_TILE = G;
export const PLAYER_TILE = P;

export type Tile = typeof E | typeof D | typeof S | typeof G | typeof P;
export type Level = Tile[][];

const level1: Level = [
    [E, G, E],
    [E, S, E],
    [E, S, E],
    [E, P, E],
];

const level2: Level = [
    [E, G, E],
    [E, S, S],
    [E, D, S],
    [E, P, S],
];

const level3: Level = [
    [E, D, G],
    [E, D, S],
    [E, S, S],
    [E, P, D],
];

const level4: Level = [
    [D, G, S],
    [D, D, S],
    [D, D, S],
    [D, P, S],
];

const level5: Level = [
    [S, S, G],
    [S, D, D],
    [S, D, D],
    [S, P, D],
];

const level6: Level = [
    [D, G, D],
    [D, S, D],
    [D, S, D],
    [D, P, D],
];

const level7: Level = [
    [G, D, D],
    [S, S, S],
    [D, D, S],
    [D, P, S],
];

const level8: Level = [
    [S, S, S],
    [S, D, G],
    [S, D, D],
    [S, P, D],
];

const level9: Level = [
    [D, D, D],
    [G, S, S],
    [D, D, S],
    [D, P, S],
];

const level10: Level = [
    [S, S, S],
    [S, D, S],
    [G, D, S],
    [D, P, S],
];

export const levels: Level[] = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10];
// export const levels: Level[] = [level10];
