import { createCheckIfPlayerIsSafeSystem } from './check-if-player-is-safe-system';
import { createRenderSystem } from './console-render-system';
import { startupSystem } from './setup-system';
import { world } from './world';

world
    .addStartupSystem(startupSystem)
    .addSystem(createCheckIfPlayerIsSafeSystem(world))
    .addSystem(createRenderSystem(world))
    .run();
