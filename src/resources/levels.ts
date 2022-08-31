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

const l0: Level = [
    [S, G, S],
    [S, S, S],
    [S, S, S],
    [S, S, S],
    [S, P, S],
];

const l1: Level = [
    [S, G, S],
    [S, D, S],
    [S, S, S],
    [S, S, S],
    [S, P, S],
];

const l2: Level = [
    [G, S, S],
    [D, D, S],
    [S, S, S],
    [S, S, S],
    [S, P, S],
];

const l3: Level = [
    [S, D, G],
    [S, D, S],
    [S, S, S],
    [S, S, S],
    [S, P, S],
];

const l4: Level = [
    [S, S, S],
    [S, G, S],
    [D, D, S],
    [S, S, S],
    [S, P, S],
];

const l5: Level = [
    [S, S, S],
    [S, S, S],
    [S, D, G],
    [S, S, D],
    [S, P, S],
];

const l6: Level = [
    [S, S, S],
    [G, D, S],
    [D, D, S],
    [S, S, S],
    [S, P, S],
];

const l7: Level = [
    [S, S, S],
    [S, S, S],
    [S, G, D],
    [S, D, S],
    [S, P, S],
];

const l8: Level = [
    [S, S, S],
    [S, D, S],
    [G, S, S],
    [D, D, S],
    [S, P, S],
];

const l9: Level = [
    [S, G, S],
    [S, D, S],
    [S, S, S],
    [D, S, D],
    [S, P, S],
];

const l10: Level = [
    [S, S, S],
    [S, D, G],
    [S, D, S],
    [S, S, S],
    [S, P, D],
];

const l11: Level = [
    [G, S, D],
    [D, S, S],
    [D, D, S],
    [S, S, S],
    [S, P, S],
];

const l12: Level = [
    [S, D, G],
    [S, S, S],
    [S, D, D],
    [S, D, S],
    [S, P, S],
];

const l13: Level = [
    [D, D, S],
    [G, S, S],
    [D, D, S],
    [S, D, S],
    [S, P, S],
];

const l14: Level = [
    [D, G, S],
    [S, D, S],
    [S, S, S],
    [D, S, D],
    [S, P, S],
];

const l15: Level = [
    [S, S, S],
    [S, D, G],
    [S, S, D],
    [D, S, S],
    [S, P, S],
];

const l16: Level = [
    [S, D, S],
    [S, S, S],
    [S, D, G],
    [S, D, D],
    [S, P, S],
];

const l17: Level = [
    [S, S, S],
    [S, D, S],
    [G, D, S],
    [D, D, S],
    [S, P, S],
];

const l18: Level = [
    [S, S, D],
    [D, G, D],
    [S, S, S],
    [S, D, S],
    [S, P, S],
];

const l19: Level = [
    [S, S, S],
    [S, D, S],
    [D, D, S],
    [G, D, S],
    [S, P, S],
];

const l20: Level = [
    [D, D, S],
    [S, S, S],
    [S, D, G],
    [S, S, D],
    [S, P, S],
];

export const levels: Level[] = [
    l0,
    l1,
    l2,
    l3,
    l4,
    l5,
    l6,
    l7,
    l8,
    l9,
    l10,
    l11,
    l12,
    l13,
    l14,
    l15,
    l16,
    l17,
    l18,
    l19,
    l20,
];
