import { Cell, Color, CellType, Capsule, CapsuleDirection, LineMatch } from '../types/GameTypes';
import { GAME_CONFIG, MATCH_LENGTH } from '../config/GameConfig';

export class GameBoard {
    private width: number;
    private height: number;
    private board: Cell[][];

    constructor(width: number = GAME_CONFIG.bottleWidth, height: number = GAME_CONFIG.bottleHeight) {
        this.width = width;
        this.height = height;
        this.board = this.createEmptyBoard();
    }

    private createEmptyBoard(): Cell[][] {
        const board: Cell[][] = [];
        for (let y = 0; y < this.height; y++) {
            board[y] = [];
            for (let x = 0; x < this.width; x++) {
                board[y][x] = this.createEmptyCell();
            }
        }
        return board;
    }

    private createEmptyCell(): Cell {
        return {
            color: Color.NONE,
            type: CellType.EMPTY,
            isMarkedForRemoval: false,
            isFalling: false
        };
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getBoard(): Cell[][] {
        return this.board;
    }

    public getCell(x: number, y: number): Cell | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.board[y][x];
    }

    public setCell(x: number, y: number, cell: Cell): void {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.board[y][x] = { ...cell };
        }
    }

    public isCellEmpty(x: number, y: number): boolean {
        if (y < 0) return true;
        const cell = this.getCell(x, y);
        return cell !== null && cell.type === CellType.EMPTY;
    }

    public canPlaceCapsule(capsule: Capsule): boolean {
        const { x, y, direction, color1, color2 } = capsule;
        
        if (direction === CapsuleDirection.HORIZONTAL) {
            if (!this.isCellEmpty(x, y) || !this.isCellEmpty(x + 1, y)) {
                return false;
            }
        } else {
            if (!this.isCellEmpty(x, y) || !this.isCellEmpty(x, y + 1)) {
                return false;
            }
        }
        return true;
    }

    public canMoveCapsule(capsule: Capsule, dx: number, dy: number): boolean {
        const { x, y, direction } = capsule;
        const newX = x + dx;
        const newY = y + dy;

        if (direction === CapsuleDirection.HORIZONTAL) {
            return this.isCellEmpty(newX, newY) && this.isCellEmpty(newX + 1, newY);
        } else {
            return this.isCellEmpty(newX, newY) && this.isCellEmpty(newX, newY + 1);
        }
    }

    public canRotateCapsule(capsule: Capsule, clockwise: boolean): boolean {
        const { x, y, direction } = capsule;
        
        if (direction === CapsuleDirection.HORIZONTAL) {
            return this.isCellEmpty(x, y + 1);
        } else {
            if (x + 1 >= this.width) {
                return this.isCellEmpty(x - 1, y);
            }
            return this.isCellEmpty(x + 1, y);
        }
    }

    public getRotatedCapsule(capsule: Capsule, clockwise: boolean): Capsule {
        const { x, y, direction, color1, color2, id } = capsule;
        
        if (direction === CapsuleDirection.HORIZONTAL) {
            return {
                id,
                x,
                y,
                color1: color2,
                color2: color1,
                direction: CapsuleDirection.VERTICAL
            };
        } else {
            let newX = x;
            if (x + 1 >= this.width) {
                newX = x - 1;
            }
            return {
                id,
                x: newX,
                y,
                color1: color2,
                color2: color1,
                direction: CapsuleDirection.HORIZONTAL
            };
        }
    }

    public placeCapsule(capsule: Capsule): void {
        const { x, y, direction, color1, color2, id } = capsule;

        if (direction === CapsuleDirection.HORIZONTAL) {
            this.board[y][x] = {
                color: color1,
                type: CellType.CAPSULE_HALF,
                capsuleId: id,
                isMarkedForRemoval: false,
                isFalling: false
            };
            this.board[y][x + 1] = {
                color: color2,
                type: CellType.CAPSULE_HALF,
                capsuleId: id,
                isMarkedForRemoval: false,
                isFalling: false
            };
        } else {
            this.board[y][x] = {
                color: color1,
                type: CellType.CAPSULE_HALF,
                capsuleId: id,
                isMarkedForRemoval: false,
                isFalling: false
            };
            this.board[y + 1][x] = {
                color: color2,
                type: CellType.CAPSULE_HALF,
                capsuleId: id,
                isMarkedForRemoval: false,
                isFalling: false
            };
        }
    }

    public placeVirus(x: number, y: number, color: Color): void {
        if (this.isCellEmpty(x, y)) {
            this.board[y][x] = {
                color,
                type: CellType.VIRUS,
                isMarkedForRemoval: false,
                isFalling: false
            };
        }
    }

    public placeGarbage(x: number, y: number): void {
        if (this.isCellEmpty(x, y)) {
            this.board[y][x] = {
                color: Color.GRAY,
                type: CellType.GARBAGE,
                isMarkedForRemoval: false,
                isFalling: false
            };
        }
    }

    public findMatches(): LineMatch[] {
        const matches: LineMatch[] = [];
        const visited = new Set<string>();

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.board[y][x];
                if (cell.type === CellType.EMPTY || cell.color === Color.NONE) {
                    continue;
                }

                const hMatch = this.findHorizontalMatch(x, y, cell.color, visited);
                if (hMatch.cells.length >= MATCH_LENGTH) {
                    matches.push(hMatch);
                    hMatch.cells.forEach(c => visited.add(`${c.x},${c.y}`));
                }

                const vMatch = this.findVerticalMatch(x, y, cell.color, visited);
                if (vMatch.cells.length >= MATCH_LENGTH) {
                    matches.push(vMatch);
                    vMatch.cells.forEach(c => visited.add(`${c.x},${c.y}`));
                }
            }
        }

        return matches;
    }

    private findHorizontalMatch(x: number, y: number, color: Color, visited: Set<string>): LineMatch {
        const cells: { x: number; y: number }[] = [];
        let startX = x;

        while (startX > 0 && this.board[y][startX - 1].color === color && this.board[y][startX - 1].type !== CellType.EMPTY) {
            startX--;
        }

        while (startX < this.width && this.board[y][startX].color === color && this.board[y][startX].type !== CellType.EMPTY) {
            if (!visited.has(`${startX},${y}`)) {
                cells.push({ x: startX, y });
            }
            startX++;
        }

        return { cells, color };
    }

    private findVerticalMatch(x: number, y: number, color: Color, visited: Set<string>): LineMatch {
        const cells: { x: number; y: number }[] = [];
        let startY = y;

        while (startY > 0 && this.board[startY - 1][x].color === color && this.board[startY - 1][x].type !== CellType.EMPTY) {
            startY--;
        }

        while (startY < this.height && this.board[startY][x].color === color && this.board[startY][x].type !== CellType.EMPTY) {
            if (!visited.has(`${x},${startY}`)) {
                cells.push({ x, y: startY });
            }
            startY++;
        }

        return { cells, color };
    }

    public markCellsForRemoval(matches: LineMatch[]): { virusesRemoved: number; capsulesRemoved: number } {
        let virusesRemoved = 0;
        let capsulesRemoved = 0;

        matches.forEach(match => {
            match.cells.forEach(({ x, y }) => {
                const cell = this.board[y][x];
                cell.isMarkedForRemoval = true;
                
                if (cell.type === CellType.VIRUS) {
                    virusesRemoved++;
                } else if (cell.type === CellType.CAPSULE_HALF) {
                    capsulesRemoved++;
                }
            });
        });

        return { virusesRemoved, capsulesRemoved };
    }

    public removeMarkedCells(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x].isMarkedForRemoval) {
                    this.board[y][x] = this.createEmptyCell();
                }
            }
        }
    }

    public applyGravity(): boolean {
        let hasFallen = false;

        for (let x = 0; x < this.width; x++) {
            let writePos = this.height - 1;
            
            for (let y = this.height - 1; y >= 0; y--) {
                if (this.board[y][x].type !== CellType.EMPTY) {
                    if (writePos !== y) {
                        this.board[writePos][x] = { ...this.board[y][x] };
                        this.board[writePos][x].isFalling = true;
                        this.board[y][x] = this.createEmptyCell();
                        hasFallen = true;
                    }
                    writePos--;
                }
            }
        }

        return hasFallen;
    }

    public clearFallingFlags(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.board[y][x].isFalling = false;
            }
        }
    }

    public isGameOver(): boolean {
        const centerX = Math.floor(this.width / 2) - 1;
        return !this.isCellEmpty(centerX, 0) && !this.isCellEmpty(centerX + 1, 0);
    }

    public getVirusCount(): number {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x].type === CellType.VIRUS) {
                    count++;
                }
            }
        }
        return count;
    }

    public reset(): void {
        this.board = this.createEmptyBoard();
    }

    public getLowestEmptyRow(x: number): number {
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.board[y][x].type === CellType.EMPTY) {
                return y;
            }
        }
        return -1;
    }

    public breakCapsuleConnections(removedCapsuleIds: Set<number>): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.board[y][x];
                if (cell.type === CellType.CAPSULE_HALF && cell.capsuleId !== undefined) {
                    if (removedCapsuleIds.has(cell.capsuleId)) {
                        delete cell.capsuleId;
                    }
                }
            }
        }
    }

    public getCapsulePositions(capsuleId: number): { x: number; y: number }[] {
        const positions: { x: number; y: number }[] = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x].capsuleId === capsuleId) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }
}
