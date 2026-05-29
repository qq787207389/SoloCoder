export enum Color {
    NONE = 0,
    RED = 1,
    BLUE = 2,
    YELLOW = 3,
    GRAY = 4
}

export enum CellType {
    EMPTY = 0,
    VIRUS = 1,
    CAPSULE_HALF = 2,
    GARBAGE = 3
}

export enum CapsuleDirection {
    HORIZONTAL = 0,
    VERTICAL = 1
}

export interface Cell {
    color: Color;
    type: CellType;
    capsuleId?: number;
    isMarkedForRemoval: boolean;
    isFalling: boolean;
}

export interface Capsule {
    id: number;
    x: number;
    y: number;
    color1: Color;
    color2: Color;
    direction: CapsuleDirection;
}

export interface GameConfig {
    bottleWidth: number;
    bottleHeight: number;
    cellSize: number;
    initialVirusCount: number;
    gravityInterval: number;
    fastGravityInterval: number;
}

export interface LineMatch {
    cells: { x: number; y: number }[];
    color: Color;
}

export interface AnimationState {
    isAnimating: boolean;
    isClearing: boolean;
    isFalling: boolean;
}

export interface GameState {
    score: number;
    level: number;
    virusesRemaining: number;
    combo: number;
    isGameOver: boolean;
    isPaused: boolean;
    isWin: boolean;
}

export interface GarbageBlock {
    count: number;
    color: Color;
}

export interface PlayerState {
    id: number;
    gameBoard: Cell[][];
    currentCapsule: Capsule | null;
    nextCapsule: Capsule | null;
    state: GameState;
    animationState: AnimationState;
    pendingGarbage: GarbageBlock[];
}
