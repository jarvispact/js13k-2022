/* eslint-disable prettier/prettier */
// export const DEAD = 0;
// export const SAFE = 1;
// export const GOAL = 2;
// export const PLAY = 3;

// export type Cell = typeof DEAD | typeof SAFE | typeof GOAL | typeof PLAY;
// export type Level = Cell[][];

// const level1: Cell[][] = [
//     [SAFE, GOAL, DEAD],
//     [SAFE, DEAD, DEAD],
//     [SAFE, SAFE, DEAD],
//     [DEAD, SAFE, SAFE],
//     [DEAD, DEAD, PLAY],
// ];

// const level2: Cell[][] = [
//     [GOAL, DEAD, DEAD],
//     [SAFE, DEAD, DEAD],
//     [SAFE, SAFE, DEAD],
//     [DEAD, SAFE, DEAD],
//     [DEAD, PLAY, DEAD],
// ];

// const level3: Cell[][] = [
//     [DEAD, SAFE, GOAL],
//     [DEAD, SAFE, DEAD],
//     [DEAD, SAFE, DEAD],
//     [DEAD, SAFE, DEAD],
//     [DEAD, PLAY, DEAD],
// ];

// export const levels: Level[] = [level1, level2, level3];

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
    [E, D, G],
    [E, D, S],
    [E, D, S],
    [E, S, S],
    [E, P, D],
];

const level4: Level = [
    [D, D, G],
    [D, S, S],
    [S, S, D],
    [S, S, D],
    [D, P, D],
];

export const levels: Level[] = [level1, level2, level3, level4];
