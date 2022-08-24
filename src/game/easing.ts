const easeInQuart = (x: number) => x * x * x * x;

const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);

export const easings = {
    easeInQuart,
    easeOutQuart,
};

export type EasingFunction = keyof typeof easings;
