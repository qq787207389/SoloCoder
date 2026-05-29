import { GameConfig } from '../types/GameTypes';

export const GAME_CONFIG: GameConfig = {
    bottleWidth: 8,
    bottleHeight: 16,
    cellSize: 32,
    initialVirusCount: 20,
    gravityInterval: 800,
    fastGravityInterval: 50
};

export const COLORS = {
    RED: 0xff4444,
    BLUE: 0x4488ff,
    YELLOW: 0xffdd44,
    GRAY: 0x888888,
    BOTTLE_GLASS: 0x88ccff,
    BOTTLE_BG: 0x0a1628,
    BACKGROUND: 0x1a1a2e
};

export const COLOR_NAMES = ['NONE', 'RED', 'BLUE', 'YELLOW', 'GRAY'];

export const SCORE = {
    VIRUS: 100,
    CAPSULE: 10,
    COMBO_MULTIPLIER: 2,
    CHAIN_BONUS: 500
};

export const CONTROLS = {
    P1: {
        LEFT: 'A',
        RIGHT: 'D',
        DOWN: 'S',
        ROTATE_CW: 'W',
        ROTATE_CCW: 'Q'
    },
    P2: {
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
        DOWN: 'DOWN',
        ROTATE_CW: 'UP',
        ROTATE_CCW: 'SHIFT'
    }
};

export const MATCH_LENGTH = 4;
