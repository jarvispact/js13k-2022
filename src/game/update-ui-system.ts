import { StartupSystem } from '../ecs/system';
import { levels } from '../resources/levels';
import { World } from './world';

const dialogContainer = document.getElementById('dialog') as HTMLDivElement;

const setLevel = (level: number) => {
    const levelDisplay = document.getElementById('level') as HTMLParagraphElement;
    levelDisplay.innerText = `Level: ${level + 1} of ${levels.length}`;
};

const setDeaths = (deaths: number) => {
    const scoreDisplay = document.getElementById('deaths') as HTMLParagraphElement;
    scoreDisplay.innerText = `Deaths: ${deaths}`;
};

const showStartDialog = (world: World) => {
    const html = `
        <dialog id="game-menu">
            <form method="dialog">
                <h1>
                    The hidden Death
                </h1>
                <p>Move with the arrow keys and try to reach the green tile. But beware! Some tiles are not solid and if you stand on them, you will fall into the void.</p>
                <p>A little hint: Within the same level, the tiles dont change. Good luck!</p>
                <div id="settings">
                    <input id="sound" type="checkbox" checked />
                    <label>Sound</label>
                </div>
                <div>
                    <button id="start">Let's do this!</button>
                </div>
            </form>
        </dialog>
    `;

    dialogContainer.innerHTML = html;

    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    const btn = document.getElementById('start') as HTMLButtonElement;

    setTimeout(() => {
        gameMenu.show();
        btn.focus();
    }, 50);

    const sound = document.getElementById('sound') as HTMLInputElement;
    sound.onchange = (event) => {
        world.dispatch({ type: 'SET_SOUND', sound: (event.target as HTMLInputElement).checked });
    };

    btn.onclick = () => {
        world.dispatch({ type: 'RUN_START_ANIMATION' });
        gameMenu.close();
    };
};

// eslint-disable-next-line prettier/prettier
const getTwitterUrl = (text: string) => `http://twitter.com/intent/tweet?text=${encodeURI(text)}&hashtags=js13k,js13k2022&url=https://js13kgames.com/entries/2022`;

const showDiedDialog = (world: World, level: number, deaths: number) => {
    // eslint-disable-next-line prettier/prettier
    const text = `I reached level ${level} ${deaths > 1 ? `but died ${deaths} times along the way` : 'and just died once'} in @jarvispact 's js13k entry for 2022: "The hidden Death". Can you do better?`;

    const uiText = deaths > 1 ? `but died ${deaths} times along the way` : 'and just died once';

    const html = `
        <dialog id="game-menu">
            <form method="dialog">
                <h1>
                    You died
                </h1>
                <p>You reached level: ${level} ${uiText}</p>
                <div>
                    <button id="new">Continue</button>
                    <a id="twitter" href="${getTwitterUrl(text)}" target="_blank">Tweet it</a>
                </div>
            </form>
        </dialog>
    `;

    dialogContainer.innerHTML = html;

    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    const btn = document.getElementById('new') as HTMLButtonElement;

    setTimeout(() => {
        gameMenu.show();
        btn.focus();
    }, 50);

    btn.onclick = () => {
        world.dispatch({
            type: 'RUN_RE_START_ANIMATION',
            level,
            deaths,
            discoveredDeadlyTilesPerLevel: world.getState().discoveredDeadlyTilesPerLevel,
        });
        gameMenu.close();
    };
};

const showGameCompletedDialog = (world: World, deaths: number) => {
    const zeroDeathsText = `I just completed all ${levels.length} levels without dying a single time in @jarvispact 's js13k entry for 2022: "The hidden Death". I bet you cannot!?`;

    // eslint-disable-next-line prettier/prettier
    const text = `I just completed all ${levels.length} levels ${deaths > 1 ? `but died ${deaths} times along the way` : 'and only died once'} in @jarvispact 's js13k entry for 2022: "The hidden Death". Can you do better?`;

    const twitterHref = getTwitterUrl(deaths === 0 ? zeroDeathsText : text);

    // eslint-disable-next-line prettier/prettier
    const uiText = deaths === 0 ? 'and did not die a single time. Great job!' : `and died ${deaths === 1 ? 'one time along the way' : `${deaths} times along the way`}`;

    const html = `
        <dialog id="game-menu">
            <form method="dialog">
                <h1>
                    Congratulations!
                </h1>
                <p>You completed all levels ${uiText}</p>
                <div>
                    <a id="twitter" href="${twitterHref}" target="_blank">Tweet it</a>
                    <button id="new">Play again</button>
                </div>
            </form>
        </dialog>
    `;

    dialogContainer.innerHTML = html;

    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    const link = document.getElementById('twitter') as HTMLAnchorElement;

    setTimeout(() => {
        gameMenu.show();
        link.focus();
    }, 50);

    const btn = document.getElementById('new') as HTMLButtonElement;
    btn.onclick = () => {
        world.dispatch({ type: 'RUN_RE_START_ANIMATION', level: 0, deaths: 0, discoveredDeadlyTilesPerLevel: {} });
        gameMenu.close();
    };
};

const flashLevelClear = () => {
    const levelClear = document.getElementById('level-clear') as HTMLParagraphElement;
    levelClear.style.opacity = '1';
    levelClear.style.fontSize = '2rem';
    setTimeout(() => {
        levelClear.style.opacity = '0';
        levelClear.style.fontSize = '1rem';
    }, 800);
};

const ui = {
    setLevel,
    setDeaths,
    showStartDialog,
    showDiedDialog,
    showGameCompletedDialog,
    flashLevelClear,
};

export const updateUiSystem: StartupSystem<World> = (world) => {
    ui.showStartDialog(world);

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'DIE') {
            ui.showDiedDialog(world, newState.currentLevel, newState.deathCounter);
            ui.setDeaths(newState.deathCounter);
        } else if (action.type === 'COMPLETE') {
            ui.showGameCompletedDialog(world, newState.deathCounter);
        } else if (
            action.type === 'RUN_LEVEL_UP_ANIMATION' ||
            action.type === 'START' ||
            action.type === 'RUN_RE_START_ANIMATION'
        ) {
            ui.setLevel(newState.currentLevel);
            ui.setDeaths(newState.deathCounter);
            if (action.type === 'RUN_LEVEL_UP_ANIMATION') ui.flashLevelClear();
        }
    });
};
