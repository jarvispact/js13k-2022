import { createRenderSystem } from './console-render-system';
import { startupSystem } from './setup-system';
import { world } from './world';

world.addStartupSystem(startupSystem).addSystem(createRenderSystem(world)).run();
