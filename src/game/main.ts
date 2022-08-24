import { createRenderSystem } from '../webgl2/render-system';
import { inputSystem } from './update-input-system';
import { levelSystem } from './level-system';
import { startupSystem } from './startup-system';
import { createUpdateTransformSystem } from './update-transform-system';
import { updateUiSystem } from './update-ui-system';
import { world } from './world';

world
    .addStartupSystem(updateUiSystem)
    .addStartupSystem(inputSystem)
    .addStartupSystem(levelSystem)
    .addStartupSystem(startupSystem)
    .addSystem(createUpdateTransformSystem(world))
    .addSystem(createRenderSystem(world))
    .run();
