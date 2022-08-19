import { createRenderSystem } from '../webgl2/render-system';
import { inputSystem } from './input-system';
import { levelSystem } from './level-system';
import { spawnEntitiesSystem } from './spawn-entities-system';
import { updateUiSystem } from './update-ui-system';
import { world } from './world';

world
    .addStartupSystem(updateUiSystem)
    .addStartupSystem(inputSystem)
    .addStartupSystem(levelSystem)
    .addStartupSystem(spawnEntitiesSystem)
    .addSystem(createRenderSystem(world))
    .run();
