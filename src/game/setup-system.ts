import { vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { CubeKind } from '../resources/levels';
import { PlayerComponent } from './components';
import { createCameraEntity, createCubeEntity, createPlayerEntity } from './entities';
import { WorldState } from './world';

type Key = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

type Boundary = { min: number; max: number };
type Boundaries = { x: Boundary; z: Boundary };

const actionMap: { [K in Key]: (playerComponent: PlayerComponent, boundaries: Boundaries) => void } = {
    ArrowDown: (playerComponent, boundaries) => {
        if (playerComponent.data.z >= boundaries.z.max) return;
        playerComponent.data.z += 1;
    },
    ArrowUp: (playerComponent, boundaries) => {
        if (playerComponent.data.z <= boundaries.z.min) return;
        playerComponent.data.z -= 1;
    },
    ArrowLeft: (playerComponent, boundaries) => {
        if (playerComponent.data.x <= boundaries.x.min) return;
        playerComponent.data.x -= 1;
    },
    ArrowRight: (playerComponent, boundaries) => {
        if (playerComponent.data.x >= boundaries.x.max) return;
        playerComponent.data.x += 1;
    },
};

export const startupSystem: StartupSystem<World<WorldState>> = (world) => {
    const { levels, currentLevel } = world.state;

    world.addEntity(
        createCameraEntity(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0), window.innerWidth / window.innerHeight),
    );

    // TODO: need to update boundaries when level change
    const boundaries: Boundaries = {
        // assuming that all columns have the same size within one level
        x: { min: 0, max: levels[currentLevel].data[0].length - 1 },
        z: { min: 0, max: levels[currentLevel].data.length - 1 },
    };

    for (let z = 0; z < levels[currentLevel].data.length; z++) {
        const column = levels[currentLevel].data[z];
        for (let x = 0; x < column.length; x++) {
            const kind = column[x] as CubeKind;
            world.addEntity(createCubeEntity(`Cube-${x}-${z}`, x, z, kind));
        }
    }

    const playerEntity = createPlayerEntity(levels[currentLevel].playerStart.x, levels[currentLevel].playerStart.z);

    document.addEventListener('keyup', (event) => {
        const playerComponent = playerEntity.getComponent('Player');
        actionMap[event.key as Key](playerComponent, boundaries);
    });

    world.addEntity(playerEntity);
};
