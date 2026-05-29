import { Color } from '../types/GameTypes';
import { GameBoard } from './GameBoard';
import { GAME_CONFIG } from '../config/GameConfig';

export class VirusGenerator {
    private gameBoard: GameBoard;
    private colors: Color[] = [Color.RED, Color.BLUE, Color.YELLOW];

    constructor(gameBoard: GameBoard) {
        this.gameBoard = gameBoard;
    }

    public generateViruses(count: number): void {
        this.gameBoard.reset();
        
        const positions = this.generatePositions(count);
        
        positions.forEach(pos => {
            this.gameBoard.placeVirus(pos.x, pos.y, pos.color);
        });
    }

    private generatePositions(count: number): { x: number; y: number; color: Color }[] {
        const positions: { x: number; y: number; color: Color }[] = [];
        const occupied = new Set<string>();
        
        const width = this.gameBoard.getWidth();
        const height = this.gameBoard.getHeight();
        
        const minY = Math.floor(height * 0.3);
        const maxY = height - 2;

        const clusterCount = Math.floor(count * 0.4);
        const scatteredCount = count - clusterCount * 3;
        const cornerCount = Math.floor(count * 0.2);
        
        for (let i = 0; i < clusterCount; i++) {
            const clusterSize = 2 + Math.floor(Math.random() * 3);
            const baseX = Math.floor(Math.random() * (width - 2));
            const baseY = minY + Math.floor(Math.random() * (maxY - minY - 2));
            
            this.generateCluster(clusterSize, baseX, baseY, width, height, occupied, positions);
        }
        
        for (let i = 0; i < scatteredCount; i++) {
            let attempts = 0;
            while (attempts < 50) {
                const x = Math.floor(Math.random() * width);
                const y = minY + Math.floor(Math.random() * (maxY - minY));
                const key = `${x},${y}`;
                
                if (!occupied.has(key) && !this.isAdjacentToCluster(x, y, occupied, 2)) {
                    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                    positions.push({ x, y, color });
                    occupied.add(key);
                    break;
                }
                attempts++;
            }
        }
        
        for (let i = 0; i < cornerCount; i++) {
            const corner = i % 4;
            let x: number, y: number;
            
            switch (corner) {
                case 0:
                    x = 0; y = minY + Math.floor(Math.random() * 3); break;
                case 1:
                    x = width - 1; y = minY + Math.floor(Math.random() * 3); break;
                case 2:
                    x = 0; y = maxY - Math.floor(Math.random() * 3); break;
                default:
                    x = width - 1; y = maxY - Math.floor(Math.random() * 3); break;
            }
            
            const key = `${x},${y}`;
            if (!occupied.has(key)) {
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                positions.push({ x, y, color });
                occupied.add(key);
            }
        }
        
        let remaining = count - positions.length;
        for (let i = 0; i < remaining; i++) {
            let attempts = 0;
            while (attempts < 100 && positions.length < count) {
                const x = Math.floor(Math.random() * width);
                const y = minY + Math.floor(Math.random() * (maxY - minY));
                const key = `${x},${y}`;
                
                if (!occupied.has(key)) {
                    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                    positions.push({ x, y, color });
                    occupied.add(key);
                    break;
                }
                attempts++;
            }
        }
        
        return positions.slice(0, count);
    }

    private generateCluster(
        size: number, baseX: number, baseY: number,
        width: number, height: number,
        occupied: Set<string>,
        positions: { x: number; y: number; color: Color }[]
    ): void {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const placed = new Set<string>();
        const toPlace = [{ x: baseX, y: baseY }];
        
        while (placed.size < size && toPlace.length > 0) {
            const idx = Math.floor(Math.random() * toPlace.length);
            const pos = toPlace.splice(idx, 1)[0];
            const key = `${pos.x},${pos.y}`;
            
            if (occupied.has(key) || placed.has(key)) continue;
            
            positions.push({ x: pos.x, y: pos.y, color });
            occupied.add(key);
            placed.add(key);
            
            const neighbors = [
                { x: pos.x + 1, y: pos.y },
                { x: pos.x - 1, y: pos.y },
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x, y: pos.y - 1 }
            ];
            
            neighbors.forEach(n => {
                const nKey = `${n.x},${n.y}`;
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                    if (!occupied.has(nKey) && !placed.has(nKey) && placed.size < size) {
                        if (Math.random() > 0.3) {
                            toPlace.push(n);
                        }
                    }
                }
            });
        }
    }

    private isAdjacentToCluster(x: number, y: number, occupied: Set<string>, minDistance: number): boolean {
        for (let dy = -minDistance; dy <= minDistance; dy++) {
            for (let dx = -minDistance; dx <= minDistance; dx++) {
                if (dx === 0 && dy === 0) continue;
                const key = `${x + dx},${y + dy}`;
                if (occupied.has(key)) {
                    return true;
                }
            }
        }
        return false;
    }

    public generateGarbagePositions(count: number): { x: number; y: number }[] {
        const positions: { x: number; y: number }[] = [];
        const width = this.gameBoard.getWidth();
        const occupied = new Set<string>();
        const minY = 4;
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            while (attempts < 100) {
                const x = Math.floor(Math.random() * width);
                let y = this.gameBoard.getLowestEmptyRow(x);
                
                if (y >= 0 && y >= minY) {
                    const key = `${x},${y}`;
                    if (!occupied.has(key)) {
                        positions.push({ x, y });
                        occupied.add(key);
                        break;
                    }
                } else if (y >= 0 && y < minY) {
                    y = minY;
                    while (y < this.gameBoard.getHeight() && !this.gameBoard.isCellEmpty(x, y)) {
                        y++;
                    }
                    if (y < this.gameBoard.getHeight()) {
                        const key = `${x},${y}`;
                        if (!occupied.has(key)) {
                            positions.push({ x, y });
                            occupied.add(key);
                            break;
                        }
                    }
                }
                attempts++;
            }
        }
        
        return positions;
    }
}
