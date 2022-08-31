import { StartupSystem } from '../ecs/system';
import { has } from '../ecs/world';
import { EMPTY_TILE, levels, PLAYER_TILE } from '../resources/levels';
import { createMap } from '../utils/create-map';
import { sleep } from '../utils/sleep';
import { TileType } from './components';
import { PlayerEntity, TileEntity } from './entities';
import { changeLevelSound, SoundPlayer } from './sound';
import { moveTargetWithAnimation } from './utils';
import { World } from './world';

export const levelSystem: StartupSystem<World> = (world) => {
    const tileEntities = world.createQuery<TileEntity>(has(TileType)).entities;

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'RUN_LEVEL_UP_ANIMATION' || action.type === 'RUN_RE_START_ANIMATION') {
            sleep(200).then(async () => {
                const playerEntity = world.getEntity<PlayerEntity>('Player');
                const playerTarget = playerEntity.getComponent('TargetTransform');
                const playerComponent = playerEntity.getComponent('Player');

                // move player out of view
                moveTargetWithAnimation(playerTarget, 1, 20, 0.05);

                await sleep(100);

                // move the tiles out of the view
                for (let i = 0; i < tileEntities.length; i++) {
                    const tileEntity = tileEntities[i];
                    const tileTarget = tileEntity.getComponent('TargetTransform');
                    moveTargetWithAnimation(tileTarget, 1, 20 + i * i, 1, 'easeInQuart');
                }

                await sleep(1000);

                const level = levels[newState.currentLevel];
                const mapZ = createMap(0, level.length - 1, -((level.length - 1) / 2), (level.length - 1) / 2);

                // move tiles and player to the correct positions
                for (let z = 0; z < level.length; z++) {
                    const column = level[z];

                    const mapX = createMap(0, column.length - 1, -((column.length - 1) / 2), (column.length - 1) / 2);

                    for (let x = 0; x < column.length; x++) {
                        const tile = column[x];

                        if (tile === PLAYER_TILE) {
                            playerComponent.data.x = x;
                            playerComponent.data.z = z;

                            playerTarget.data.position[0] = mapX(x) * 2.35;
                            playerTarget.data.position[2] = mapZ(z) * 2.35;
                        }

                        const tileEntityForTile = world.getEntity<TileEntity>(`Tile-${x}-${z}`);
                        const tileComponent = tileEntityForTile.getComponent('Tile');
                        const tileTarget = tileEntityForTile.getComponent('TargetTransform');

                        tileComponent.data.x = x;
                        tileComponent.data.z = z;

                        tileComponent.data.tile = newState.discoveredDeadlyTilesPerLevel[newState.currentLevel]?.find(
                            (pos) => pos.x === x && pos.z === z,
                        )
                            ? EMPTY_TILE
                            : tile;

                        tileTarget.data.position[0] = mapX(x) * 2.35;
                        tileTarget.data.position[2] = mapZ(z) * 2.35;
                    }
                }

                SoundPlayer.play(changeLevelSound);

                // move tiles back into view
                for (let i = 0; i < tileEntities.length; i++) {
                    const tileEntity = tileEntities[i];
                    const tileTarget = tileEntity.getComponent('TargetTransform');
                    moveTargetWithAnimation(tileTarget, 1, 0, 0.05);
                }

                await sleep(1000);

                // move player back into view
                moveTargetWithAnimation(playerTarget, 1, 1.2, 0.1);

                await sleep(1000);

                if (action.type === 'RUN_LEVEL_UP_ANIMATION') {
                    world.dispatch({ type: 'LEVEL_UP' });
                }

                if (action.type === 'RUN_RE_START_ANIMATION') {
                    world.dispatch({ type: 'RE_START' });
                }
            });
        }
    });
};
