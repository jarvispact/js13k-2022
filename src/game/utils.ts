import { TargetPositionComponent } from './components';

export const moveTargetWithAnimation = (
    playerTarget: TargetPositionComponent,
    direction: 0 | 1 | 2,
    finalPosition: number,
    speed: number,
) => {
    playerTarget.data.position[direction] = finalPosition;
    playerTarget.data.easing.function = 'easeOutQuart';
    playerTarget.data.easing.time = 0;
    playerTarget.data.easing.increment = speed;
};
