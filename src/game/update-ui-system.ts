import { StartupSystem } from '../ecs/system';
import { World } from '../ecs/world';
import { WorldAction, WorldEvent, WorldState } from './world';

const setLevel = (level: number) => {
    const levelDisplay = document.getElementById('level') as HTMLParagraphElement;
    levelDisplay.innerText = `Level: ${level + 1}`;
};

const setScore = (score: number) => {
    const scoreDisplay = document.getElementById('score') as HTMLParagraphElement;
    scoreDisplay.innerText = `Score: ${score}`;
};

const toggleGameMenu = () => {
    const gameMenu = document.getElementById('game-menu') as HTMLDialogElement;
    if (!gameMenu.open) {
        gameMenu.show();
    } else {
        gameMenu.close();
    }
};

const ui = {
    setLevel,
    setScore,
    toggleGameMenu,
};

export const updateUiSystem: StartupSystem<World<WorldState, WorldAction, WorldEvent>> = (world) => {
    const startButton = document.getElementById('start') as HTMLButtonElement;

    startButton.addEventListener('click', () => {
        world.dispatch({ type: 'START' });
        ui.toggleGameMenu();
    });

    world.onStateChange(({ action, newState }) => {
        if (action.type === 'INCREMENT_SCORE') {
            ui.setScore(newState.score);
        } else if (action.type === 'GAME_OVER') {
            ui.toggleGameMenu();
        } else if (action.type === 'LEVEL_UP') {
            ui.setLevel(newState.currentLevel);
        }
    });
};
