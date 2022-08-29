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

const l1: Level = [
    [E, G, E],
    [E, S, E],
    [E, S, E],
    [E, P, E],
    [E, E, E],
];

const l2: Level = [
    [E, G, E],
    [E, S, S],
    [E, D, S],
    [E, P, S],
    [E, E, E],
];

const l3: Level = [
    [E, D, G],
    [E, D, S],
    [E, S, S],
    [E, P, D],
    [E, E, E],
];

const l4: Level = [
    [G, D, E],
    [S, D, E],
    [S, S, E],
    [D, P, E],
    [E, E, E],
];

const l5: Level = [
    [D, G, S],
    [D, D, S],
    [D, D, S],
    [D, P, S],
    [E, E, E],
];

const l6: Level = [
    [S, S, G],
    [S, D, D],
    [S, D, D],
    [S, P, D],
    [E, E, E],
];

const l7: Level = [
    [D, G, D],
    [D, S, D],
    [D, S, D],
    [D, P, D],
    [E, E, E],
];

const l8: Level = [
    [G, D, D],
    [S, S, S],
    [D, D, S],
    [D, P, S],
    [E, E, E],
];

const l9: Level = [
    [S, S, S],
    [S, D, G],
    [S, D, D],
    [S, P, D],
    [E, E, E],
];

const l10: Level = [
    [D, D, D],
    [G, S, S],
    [D, D, S],
    [D, P, S],
    [E, E, E],
];

const l11: Level = [
    [S, S, S],
    [S, D, S],
    [G, D, S],
    [D, P, S],
    [E, E, E],
];

const l12: Level = [
    [D, D, D],
    [S, S, S],
    [S, D, G],
    [S, D, D],
    [S, P, D],
];

const l13: Level = [
    [S, S, S],
    [G, D, S],
    [D, S, S],
    [D, S, D],
    [D, P, D],
];

const l14: Level = [
    [S, G, D],
    [S, D, D],
    [S, S, S],
    [D, D, S],
    [D, P, S],
];

const l15: Level = [
    [D, D, D],
    [S, S, S],
    [S, D, S],
    [G, D, S],
    [D, P, S],
];

export const levels: Level[] = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, l11, l12, l13, l14, l15];
