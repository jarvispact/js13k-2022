import { TargetPositionComponent } from './components';
import { EasingFunction } from './easing';

export const moveTargetWithAnimation = (
    playerTarget: TargetPositionComponent,
    direction: 0 | 1 | 2,
    finalPosition: number,
    speed: number,
    func: EasingFunction = 'easeOutQuart',
) => {
    playerTarget.data.position[direction] = finalPosition;
    playerTarget.data.easing.function = func;
    playerTarget.data.easing.time = 0;
    playerTarget.data.easing.increment = speed;
};
