import { vec3 } from 'gl-matrix';
import { StartupSystem } from '../ecs/system';
import { levels, PLAYER_TILE } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { sleep } from '../utils/sleep';
import { createCameraEntity, createPlayerEntity, createTileEntity } from './entities';
import { changeLevelSound, SoundPlayer } from './sound';
import { World } from './world';

export const startupSystem: StartupSystem<World> = (world) => {
    const aspect = window.innerWidth / window.innerHeight;

    world.spawnEntity(
        createCameraEntity({
            position: vec3.fromValues(
                0,
                window.innerWidth < 1200 ? 6 : 3,
                aspect < 0.48 ? 20 : window.innerWidth < 1200 ? 16 : 12,
            ),
            lookAt: vec3.fromValues(0, 0, 3),
            aspect,
        }),
    );

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'RUN_START_ANIMATION') {
            SoundPlayer.play(changeLevelSound);
            const level = levels[newState.currentLevel];

            const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

            let i = 0;

            for (let z = 0; z < level.length; z++) {
                const column = level[z];

                const columnLength = column.length - 1;
                const mapX = createMap(0, columnLength, -(columnLength / 2), columnLength / 2);

                for (let x = 0; x < column.length; x++) {
                    const tile = column[x];

                    if (tile === PLAYER_TILE) {
                        sleep(1000).then(() => {
                            world.spawnEntity(
                                createPlayerEntity({
                                    player: { x, z },
                                    transform: {
                                        position: vec3.fromValues(mapX(x) * 2.35, 20, mapZ(z) * 2.35),
                                        scale: vec3.fromValues(1, 1, 1),
                                    },
                                    targetTransform: {
                                        position: vec3.fromValues(mapX(x) * 2.35, 1.2, mapZ(z) * 2.35),
                                        scale: vec3.fromValues(1, 1, 1),
                                        easing: { function: 'easeOutQuart', time: 0, increment: 0.1 },
                                    },
                                }),
                            );
                        });
                    }

                    world.spawnEntity(
                        createTileEntity(`Tile-${x}-${z}`, {
                            tile: { x, z, tile },
                            transform: {
                                position: vec3.fromValues(mapX(x) * 2.35, 20 + i * i, mapZ(z) * 2.35),
                                scale: vec3.fromValues(1, 0.2, 1),
                            },
                            targetTransform: {
                                position: vec3.fromValues(mapX(x) * 2.35, 0, mapZ(z) * 2.35),
                                scale: vec3.fromValues(1, 0.2, 1),
                                easing: { function: 'easeOutQuart', time: 0, increment: 0.05 },
                            },
                        }),
                    );

                    i++;

                    if (z === level.length - 1 && x === column.length - 1) {
                        sleep(2000).then(() => {
                            world.dispatch({ type: 'START' });
                        });
                    }
                }
            }
        }
    });
};
