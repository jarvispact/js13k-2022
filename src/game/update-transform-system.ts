import { mat4, vec3 } from 'gl-matrix';
import { Entity } from '../ecs/entity';
import { System } from '../ecs/system';
import { and, has } from '../ecs/world';
import { TargetPositionComponent, TargetTransformType, TransformComponent, TransformType } from './components';
import { easings } from './easing';
import { World } from './world';

export const createUpdateTransformSystem = (world: World): System => {
    const entities = world.createQuery<Entity<string, (TransformComponent | TargetPositionComponent)[]>>(
        and([has(TransformType), has(TargetTransformType)]),
    ).entities;

    return (delta) => {
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            const t = entity.getComponent('Transform');
            const tp = entity.getComponent('TargetTransform');

            vec3.lerp(
                t.data.position,
                t.data.position,
                tp.data.position,
                easings[tp.data.easing.function](Math.min(tp.data.easing.time, 1)),
            );

            if (tp.data.easing.time < 1) {
                tp.data.easing.time += tp.data.easing.increment * delta;
            }

            mat4.fromRotationTranslationScale(t.data.modelMatrix, t.data.rotation, t.data.position, t.data.scale);
        }
    };
};
