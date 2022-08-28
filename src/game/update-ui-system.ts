import { StartupSystem } from '../ecs/system';
import { levels } from '../resources/levels';
import { World } from './world';

const dialogContainer = document.getElementById('dialog') as HTMLDivElement;

const setLevel = (level: number) => {
    const levelDisplay = document.getElementById('level') as HTMLParagraphElement;
    levelDisplay.innerText = `Level: ${level + 1}`;
};

const setScore = (score: number) => {
    const scoreDisplay = document.getElementById('score') as HTMLParagraphElement;
    scoreDisplay.innerText = `Score: ${score}`;
};

const showStartDialog = (world: World) => {
    const html = `
        <dialog id="game-menu">
        <form method="dialog">
            <h1>
                The hidden Death
            </h1>
            <p>Move with your arrow keys and try to reach the marked tile. But beware! Some tiles are not solid and if you stand on them, you will fall into the void.</p>
            <div>
                <button id="start">Let's do this</button>
            </div>
        </form>
        </dialog>
    `;

    dialogContainer.innerHTML = html;

    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    setTimeout(() => {
        gameMenu.show();
    }, 50);

    const btn = document.getElementById('start') as HTMLButtonElement;
    btn.focus();

    btn.onclick = () => {
        world.dispatch({ type: 'RUN_START_ANIMATION' });
        gameMenu.close();
    };
};

// eslint-disable-next-line prettier/prettier
const getTwitterUrl = (text: string) => `http://twitter.com/intent/tweet?text=${encodeURI(text)}&hashtags=js13k,js13k2022&url=https://js13kgames.com/entries/2022`;

const showGameOverDialog = (world: World, level: number) => {
    // eslint-disable-next-line prettier/prettier
    const text = `I just died in level ${level + 1} in @jarvispact 's js13k entry for 2022: "The hidden Death". Can you get a higher score?`;

    const html = `
        <dialog id="game-menu">
        <form method="dialog">
            <h1>
                Oh no, you died!
            </h1>
            <p>You died in level: ${level + 1}.</p>
            <div>
                <a id="twitter" href="${getTwitterUrl(text)}" target="_blank">Tweet it</a>
                <button id="new">Try again</button>
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
        world.dispatch({ type: 'RE_START' });
        gameMenu.close();
    };
};

const showGameCompletedDialog = (world: World) => {
    const text = `I just completed all ${levels.length} levels in @jarvispact 's js13k entry for 2022: "The hidden Death". Can you also complete all levels?`;

    const html = `
        <dialog id="game-menu">
        <form method="dialog">
            <h1>
                Congratulations!
            </h1>
            <p>You completed all levels</p>
            <div>
                <a id="twitter" href="${getTwitterUrl(text)}" target="_blank">Tweet it</a>
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
        world.dispatch({ type: 'RE_START' });
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
    setScore,
    showStartDialog,
    showGameOverDialog,
    showGameCompletedDialog,
    flashLevelClear,
};

export const updateUiSystem: StartupSystem<World> = (world) => {
    ui.showStartDialog(world);

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'GAME_OVER') {
            ui.showGameOverDialog(world, newState.currentLevel);
        } else if (action.type === 'COMPLETE') {
            ui.showGameCompletedDialog(world);
        } else if (action.type === 'RUN_LEVEL_UP_ANIMATION' || action.type === 'START' || action.type === 'RE_START') {
            ui.setLevel(newState.currentLevel);
            if (action.type === 'RUN_LEVEL_UP_ANIMATION') ui.flashLevelClear();
        }
    });
};
