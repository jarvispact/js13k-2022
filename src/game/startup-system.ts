import { vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { Cell, DEAD, GOAL, PLAY, SAFE } from '../resources/levels';
import { PlayerComponent } from './components';
import { createCameraEntity, createCubeEntity, createPlayerEntity } from './entities';
import { WorldState, WorldAction } from './world';

const actionKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const;
type Key = typeof actionKeys[number];

const isActionKey = (key: unknown): key is Key => actionKeys.includes(key as Key);

type Boundary = { min: number; max: number };
type Boundaries = { x: Boundary; z: Boundary };

export const startupSystem: StartupSystem<World<WorldState, WorldAction>> = (world) => {
    const { levels, currentLevel } = world.getState();

    const updateWorld = (playerComponent: PlayerComponent, level: Cell[][]) => {
        const kind = level[playerComponent.data.z][playerComponent.data.x];
        if (kind === SAFE) {
            world.dispatch({ type: 'INCREMENT_SCORE' });
        } else if (kind === DEAD) {
            world.dispatch({ type: 'GAME_OVER' });
        } else if (kind === GOAL) {
            world.dispatch({ type: 'LEVEL_UP' });
        }
    };

    const actionMap: {
        [K in Key]: (playerComponent: PlayerComponent, boundaries: Boundaries, level: Cell[][]) => void;
    } = {
        ArrowDown: (playerComponent, boundaries, level) => {
            if (playerComponent.data.z >= boundaries.z.max) return;
            playerComponent.data.z += 1;
            updateWorld(playerComponent, level);
        },
        ArrowUp: (playerComponent, boundaries, level) => {
            if (playerComponent.data.z <= boundaries.z.min) return;
            playerComponent.data.z -= 1;
            updateWorld(playerComponent, level);
        },
        ArrowLeft: (playerComponent, boundaries, level) => {
            if (playerComponent.data.x <= boundaries.x.min) return;
            playerComponent.data.x -= 1;
            updateWorld(playerComponent, level);
        },
        ArrowRight: (playerComponent, boundaries, level) => {
            if (playerComponent.data.x >= boundaries.x.max) return;
            playerComponent.data.x += 1;
            updateWorld(playerComponent, level);
        },
    };

    world.spawnEntity(
        createCameraEntity(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0), window.innerWidth / window.innerHeight),
    );

    // TODO: need to update boundaries when level change
    const boundaries: Boundaries = {
        // assuming that all columns have the same size within one level
        x: { min: 0, max: levels[currentLevel].data[0].length - 1 },
        z: { min: 0, max: levels[currentLevel].data.length - 1 },
    };

    const playerStart: { x: number; z: number } = { x: 0, z: 0 };

    for (let z = 0; z < levels[currentLevel].data.length; z++) {
        const column = levels[currentLevel].data[z];
        for (let x = 0; x < column.length; x++) {
            const kind = column[x] as Cell;
            world.spawnEntity(createCubeEntity(`Cube-${x}-${z}`, x, z, kind));
            if (kind === PLAY) {
                playerStart.x = x;
                playerStart.z = z;
            }
        }
    }

    const playerEntity = createPlayerEntity(playerStart.x, playerStart.z);

    document.addEventListener('keyup', (event) => {
        if (!isActionKey(event.key)) return;
        const currentLevelData = levels[currentLevel].data;
        const playerComponent = playerEntity.getComponent('Player');
        actionMap[event.key](playerComponent, boundaries, currentLevelData);
    });

    world.spawnEntity(playerEntity);
};
