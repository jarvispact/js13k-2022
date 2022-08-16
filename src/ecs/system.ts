import { World } from './world';

type CleanupFunction = () => void;

export type System = (delta: number, time: number) => void | CleanupFunction;

export type StartupSystem<W extends World = World> = (world: W) => void;
