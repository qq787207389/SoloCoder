import { LineMatch, CellType, Color } from '../types/GameTypes';
import { GameBoard } from './GameBoard';
import { SCORE } from '../config/GameConfig';

export interface MatchResult {
    matches: LineMatch[];
    virusesRemoved: number;
    capsulesRemoved: number;
    score: number;
    isChain: boolean;
    chainLevel: number;
}

export class MatchResolver {
    private gameBoard: GameBoard;
    private chainLevel: number = 0;

    constructor(gameBoard: GameBoard) {
        this.gameBoard = gameBoard;
    }

    public resolveMatches(): MatchResult | null {
        const matches = this.gameBoard.findMatches();
        
        if (matches.length === 0) {
            this.chainLevel = 0;
            return null;
        }

        this.chainLevel++;
        
        const { virusesRemoved, capsulesRemoved } = this.gameBoard.markCellsForRemoval(matches);
        
        let score = 0;
        score += virusesRemoved * SCORE.VIRUS;
        score += capsulesRemoved * SCORE.CAPSULE;
        
        if (this.chainLevel > 1) {
            score *= SCORE.COMBO_MULTIPLIER;
            score += SCORE.CHAIN_BONUS * (this.chainLevel - 1);
        }

        if (matches.length > 1) {
            score *= SCORE.COMBO_MULTIPLIER;
        }

        const removedCapsuleIds = new Set<number>();
        matches.forEach(match => {
            match.cells.forEach(({ x, y }) => {
                const cell = this.gameBoard.getCell(x, y);
                if (cell && cell.capsuleId !== undefined) {
                    removedCapsuleIds.add(cell.capsuleId);
                }
            });
        });

        this.gameBoard.breakCapsuleConnections(removedCapsuleIds);

        return {
            matches,
            virusesRemoved,
            capsulesRemoved,
            score,
            isChain: this.chainLevel > 1,
            chainLevel: this.chainLevel
        };
    }

    public removeMatchedCells(): void {
        this.gameBoard.removeMarkedCells();
    }

    public applyGravity(): boolean {
        return this.gameBoard.applyGravity();
    }

    public clearFallingFlags(): void {
        this.gameBoard.clearFallingFlags();
    }

    public hasMoreMatches(): boolean {
        const matches = this.gameBoard.findMatches();
        return matches.length > 0;
    }

    public resetChain(): void {
        this.chainLevel = 0;
    }

    public getChainLevel(): number {
        return this.chainLevel;
    }

    public async resolveFullChain(
        onMatch: (result: MatchResult) => Promise<void>,
        onFall: () => Promise<void>
    ): Promise<MatchResult[]> {
        const allResults: MatchResult[] = [];
        
        let result = this.resolveMatches();
        while (result) {
            allResults.push(result);
            await onMatch(result);
            
            this.removeMatchedCells();
            
            let hasFallen = this.applyGravity();
            while (hasFallen) {
                await onFall();
                this.clearFallingFlags();
                hasFallen = this.applyGravity();
            }
            
            result = this.resolveMatches();
        }
        
        this.resetChain();
        return allResults;
    }
}
