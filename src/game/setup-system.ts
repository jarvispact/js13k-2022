import { vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { CubeKind } from '../resources/levels';
import { createCameraEntity, createCubeEntity, createPlayerEntity } from './entities';
import { WorldState } from './world';

export const startupSystem: StartupSystem<World<WorldState>> = (world) => {
    world.addEntity(
        createCameraEntity(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0), window.innerWidth / window.innerHeight),
    );

    for (let z = 0; z < world.state.currentLevel.length; z++) {
        const column = world.state.currentLevel[z];
        for (let x = 0; x < column.length; x++) {
            const kind = column[x] as CubeKind;
            world.addEntity(createCubeEntity(`Cube-${x}-${z}`, x, z, kind));
        }
    }

    world.addEntity(createPlayerEntity(1, world.state.currentLevel.length - 1));

    console.log(world);
};
