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
    [E, S, E],
    [E, P, E],
];

const level2: Level = [
    [E, G, E],
    [E, S, S],
    [E, D, S],
    [E, S, S],
    [E, P, E],
];

const level3: Level = [
    [E, G, E],
    [S, S, S],
    [S, D, S],
    [S, S, S],
    [E, P, E],
];

const level4: Level = [
    [S, S, G],
    [S, D, D],
    [S, S, S],
    [D, D, S],
    [D, P, S],
];

export const levels: Level[] = [level1, level2, level3, level4];
