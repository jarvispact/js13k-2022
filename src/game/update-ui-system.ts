import { StartupSystem } from '../ecs/system';
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
                Welcome to my JS13K Game for 2022!
            </h1>
            <p>Go to the marked cube without dying. Use the arrow keys to move. Good luck!</p>
            <div>
                <button id="start">New Game</button>
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

        setTimeout(() => {
            world.dispatch({ type: 'START' });
        }, 1500);
    };
};

const showGameOverDialog = (world: World) => {
    const html = `
        <dialog id="game-menu">
        <form method="dialog">
            <h1>
                Oh no, you died!
            </h1>
            <div>
                <button id="new">Try again</button>
            </div>
        </form>
        </dialog>
    `;

    dialogContainer.innerHTML = html;

    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    setTimeout(() => {
        gameMenu.show();
    }, 50);

    const btn = document.getElementById('new') as HTMLButtonElement;
    btn.focus();

    btn.onclick = () => {
        world.dispatch({ type: 'START' });
        gameMenu.close();
    };
};

const showGameCompletedDialog = () => {
    const html = `
        <dialog id="game-menu">
        <form method="dialog">
            <h1>
                Congratulations!
            </h1>
            <p>You completed all levels</p>
            <div>
                <button id="tweet">Tweet it</button>
            </div>
        </form>
        </dialog>
    `;

    dialogContainer.innerHTML = html;

    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    setTimeout(() => {
        gameMenu.show();
    }, 50);

    const btn = document.getElementById('tweet') as HTMLButtonElement;
    btn.focus();

    btn.onclick = () => {
        alert('tweet it');
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
            ui.showGameOverDialog(world);
        } else if (action.type === 'COMPLETE') {
            ui.showGameCompletedDialog();
        } else if (action.type === 'RUN_LEVEL_UP_ANIMATION') {
            ui.setLevel(newState.currentLevel);
            ui.flashLevelClear();
        }
    });
};
