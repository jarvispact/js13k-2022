import { world } from './world';

type TimeFunction = (i: number, n: number) => number;

export const moveSound = (t: TimeFunction, i: number) => {
    const n = 1e4;
    if (i > n) return null;
    return (Math.pow(i, 1.055) & 128 ? 1 : -1) * Math.pow(t(i, n), 2);
};

export const dieSound = (t: TimeFunction, i: number) => {
    i = Math.pow(i, 0.96) * 1.3;
    const n = 9e4;
    if (i > n) return null;
    return ((i + Math.sin(i / 1900) * 80) & 64 ? 1 : -1) * Math.pow(t(i, n), 3);
};

export const levelUpSound = (t: TimeFunction, i: number) => {
    const notes = [0, 4, 7, 12, undefined, 7, 12];
    const n = 3.5e4;
    if (i > n) return null;
    const idx = ((notes.length * i) / n) | 0;
    const note = notes[idx];
    if (note === undefined) return 0;
    const r = Math.pow(2, note / 12) * 0.8;
    const q = t((i * notes.length) % n, n);
    return (i * r) & 64 ? q : -q;
};

export const changeLevelSound = (t: TimeFunction, i: number) => {
    const n = 11e4;
    if (i > n) return null;
    const q = t(i, n);
    return Math.sin(i * 0.001 * Math.sin(0.009 * i + Math.sin(i / 200)) + Math.sin(i / 100)) * q * q;
};

const createSoundPlayer = () => {
    const t = (i: number, n: number) => (n - i) / n;

    const A = new AudioContext();
    const m = A.createBuffer(1, 96e3, 48e3);
    const b = m.getChannelData(0);

    return {
        play: (sound: (t: TimeFunction, i: number) => number | null) => {
            if (!world.getState().sound) return;

            for (let i = 96e3; i--; ) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                b[i] = sound(t, i);
            }

            const s = A.createBufferSource();
            s.buffer = m;
            s.connect(A.destination);
            s.start();
        },
    };
};

export const SoundPlayer = createSoundPlayer();
