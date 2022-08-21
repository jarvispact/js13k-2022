import { mat4, vec3 } from 'gl-matrix';
import { Entity } from '../ecs/entity';
import { System } from '../ecs/system';
import { and, has, World } from '../ecs/world';
import { TargetPositionComponent, TargetPositionType, TransformComponent, TransformType } from './components';
import { WorldAction, WorldEvent, WorldState } from './world';

const easeInOutElastic = (x: number) => {
    const c5 = (2 * Math.PI) / 4.5;

    return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
};

export const createUpdateTransformSystem = (world: World<WorldState, WorldAction, WorldEvent>): System => {
    const entities = world.createQuery<Entity<string, (TransformComponent | TargetPositionComponent)[]>>(
        and([has(TransformType), has(TargetPositionType)]),
    ).entities;

    return () => {
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const t = entity.getComponent('Transform');
            const tp = entity.getComponent('TargetPosition');
            vec3.lerp(t.data.position, t.data.position, tp.data.position, easeInOutElastic(tp.data.easing));
            mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.rotation, t.data.position, t.data.scale);
        }
    };
};
