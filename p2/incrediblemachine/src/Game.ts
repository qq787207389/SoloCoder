import Matter from 'matter-js';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { Renderer } from './renderer/Renderer';
import { PartFactory } from './parts/PartFactory';
import { HistoryManager } from './HistoryManager';
import { levels, toolDefinitions } from './levels/levels';
import { Part, Level, GameState, PartType, SerializedLevel } from './types';

export class Game {
  private canvas: HTMLCanvasElement;
  private physicsEngine: PhysicsEngine;
  private renderer: Renderer;
  private historyManager: HistoryManager;
  private parts: Part[] = [];
  private currentLevel?: Level;
  private gameState: GameState = 'editing';
  private marble?: Matter.Body;
  private animationId: number = 0;
  private dragState: {
    isDragging: boolean;
    part: Part | null;
    dragOffset: { x: number; y: number };
    isNewPart: boolean;
    newPartType: PartType | null;
    startPosition: { x: number; y: number; rotation: number } | null;
  } = {
    isDragging: false,
    part: null,
    dragOffset: { x: 0, y: 0 },
    isNewPart: false,
    newPartType: null,
    startPosition: null
  };
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private snapGridSize: number = 25;
  private onStateChange?: (state: GameState) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.physicsEngine = new PhysicsEngine();
    this.renderer = new Renderer(canvas);
    this.historyManager = new HistoryManager();
    
    this.setupEventListeners();
    this.startGameLoop();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  private handleMouseDown(e: MouseEvent): void {
    if (this.gameState !== 'editing') return;
    
    this.canvas.focus();
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedPart = this.getPartAtPosition(x, y);
    
    if (clickedPart) {
      this.selectPart(clickedPart);
      this.startDraggingPart(clickedPart, x, y);
    } else {
      this.deselectAllParts();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    if (this.dragState.isDragging && this.dragState.part) {
      this.updateDragPosition();
    }
  }

  private handleMouseUp(_e: MouseEvent): void {
    if (this.dragState.isDragging) {
      this.finishDragging();
    }
  }

  private handleWheel(e: WheelEvent): void {
    if (this.gameState !== 'editing') return;
    
    const selectedPart = this.parts.find(p => p.isSelected);
    if (selectedPart) {
      e.preventDefault();
      const oldState = { x: selectedPart.x, y: selectedPart.y, rotation: selectedPart.rotation };
      const delta = e.deltaY > 0 ? 0.1 : -0.1;
      this.rotatePart(selectedPart, selectedPart.rotation + delta);
      
      this.historyManager.pushAction({
        type: 'rotate',
        partId: selectedPart.id,
        oldState,
        newState: { x: selectedPart.x, y: selectedPart.y, rotation: selectedPart.rotation }
      });
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.gameState !== 'editing') return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const selectedPart = this.parts.find(p => p.isSelected);
      if (selectedPart) {
        this.removePart(selectedPart);
      }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      this.redo();
    }
  }

  private getPartAtPosition(x: number, y: number): Part | null {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const part = this.parts[i];
      for (const body of part.bodies) {
        if (Matter.Bounds.contains(body.bounds, { x, y })) {
          return part;
        }
      }
    }
    return null;
  }

  private selectPart(part: Part): void {
    this.deselectAllParts();
    part.isSelected = true;
  }

  private deselectAllParts(): void {
    this.parts.forEach(p => p.isSelected = false);
  }

  private startDraggingPart(part: Part, x: number, y: number): void {
    this.dragState = {
      isDragging: true,
      part,
      dragOffset: {
        x: x - part.x,
        y: y - part.y
      },
      isNewPart: false,
      newPartType: null,
      startPosition: { x: part.x, y: part.y, rotation: part.rotation }
    };
  }

  startDraggingNewPart(type: PartType, x: number, y: number): void {
    if (this.gameState !== 'editing') return;
    
    const snappedX = Math.round(x / this.snapGridSize) * this.snapGridSize;
    const snappedY = Math.round(y / this.snapGridSize) * this.snapGridSize;
    
    const newPart = PartFactory.createPart(type, snappedX, snappedY, 0);
    this.addPartToWorld(newPart);
    this.parts.push(newPart);
    this.selectPart(newPart);
    
    this.dragState = {
      isDragging: true,
      part: newPart,
      dragOffset: { x: x - snappedX, y: y - snappedY },
      isNewPart: true,
      newPartType: type,
      startPosition: { x: snappedX, y: snappedY, rotation: 0 }
    };
  }

  private updateDragPosition(): void {
    if (!this.dragState.part) return;
    
    let newX = this.mousePosition.x - this.dragState.dragOffset.x;
    let newY = this.mousePosition.y - this.dragState.dragOffset.y;
    
    newX = Math.round(newX / this.snapGridSize) * this.snapGridSize;
    newY = Math.round(newY / this.snapGridSize) * this.snapGridSize;
    
    this.movePart(this.dragState.part, newX, newY);
  }

  private finishDragging(): void {
    if (!this.dragState.part) return;
    
    const draggedPart = this.dragState.part;
    const startPos = this.dragState.startPosition;
    
    if (this.dragState.isNewPart) {
      this.historyManager.pushAction({
        type: 'add',
        partId: draggedPart.id,
        serializedPart: PartFactory.serializePart(draggedPart)
      });
    } else if (startPos) {
      const hasMoved = 
        startPos.x !== draggedPart.x || 
        startPos.y !== draggedPart.y || 
        startPos.rotation !== draggedPart.rotation;
      
      if (hasMoved) {
        this.historyManager.pushAction({
          type: 'move',
          partId: draggedPart.id,
          oldState: { x: startPos.x, y: startPos.y, rotation: startPos.rotation },
          newState: { x: draggedPart.x, y: draggedPart.y, rotation: draggedPart.rotation }
        });
      }
    }
    
    this.selectPart(draggedPart);
    
    this.dragState = {
      isDragging: false,
      part: null,
      dragOffset: { x: 0, y: 0 },
      isNewPart: false,
      newPartType: null,
      startPosition: null
    };
  }

  private movePart(part: Part, x: number, y: number): void {
    const dx = x - part.x;
    const dy = y - part.y;
    
    part.x = x;
    part.y = y;
    
    part.bodies.forEach(body => {
      Matter.Body.setPosition(body, {
        x: body.position.x + dx,
        y: body.position.y + dy
      });
    });
  }

  private rotatePart(part: Part, rotation: number): void {
    const delta = rotation - part.rotation;
    part.rotation = rotation;
    
    part.bodies.forEach(body => {
      const newAngle = body.angle + delta;
      Matter.Body.setAngle(body, newAngle);
    });
  }

  private addPartToWorld(part: Part): void {
    part.bodies.forEach(body => this.physicsEngine.addBody(body));
    part.constraints.forEach(constraint => this.physicsEngine.addConstraint(constraint));
  }

  private removePartFromWorld(part: Part): void {
    part.bodies.forEach(body => this.physicsEngine.removeBody(body));
    part.constraints.forEach(constraint => this.physicsEngine.removeConstraint(constraint));
  }

  addPart(part: Part): void {
    this.addPartToWorld(part);
    this.parts.push(part);
  }

  removePart(part: Part): void {
    const index = this.parts.indexOf(part);
    if (index > -1) {
      this.historyManager.pushAction({
        type: 'remove',
        partId: part.id,
        serializedPart: PartFactory.serializePart(part)
      });
      
      this.removePartFromWorld(part);
      this.parts.splice(index, 1);
    }
  }

  undo(): void {
    const action = this.historyManager.undo();
    if (!action) return;
    
    switch (action.type) {
      case 'add':
        if (action.partId) {
          const part = this.parts.find(p => p.id === action.partId);
          if (part) {
            this.removePartFromWorld(part);
            const index = this.parts.indexOf(part);
            if (index > -1) this.parts.splice(index, 1);
          }
        }
        break;
      case 'remove':
        if (action.serializedPart) {
          const part = PartFactory.deserializePart(action.serializedPart);
          this.addPartToWorld(part);
          this.parts.push(part);
        }
        break;
      case 'move':
      case 'rotate':
        if (action.partId && action.oldState) {
          const part = this.parts.find(p => p.id === action.partId);
          if (part) {
            this.movePart(part, action.oldState.x, action.oldState.y);
            this.rotatePart(part, action.oldState.rotation);
          }
        }
        break;
    }
  }

  redo(): void {
    const action = this.historyManager.redo();
    if (!action) return;
    
    switch (action.type) {
      case 'add':
        if (action.serializedPart) {
          const part = PartFactory.deserializePart(action.serializedPart);
          this.addPartToWorld(part);
          this.parts.push(part);
        }
        break;
      case 'remove':
        if (action.partId) {
          const part = this.parts.find(p => p.id === action.partId);
          if (part) {
            this.removePartFromWorld(part);
            const index = this.parts.indexOf(part);
            if (index > -1) this.parts.splice(index, 1);
          }
        }
        break;
      case 'move':
      case 'rotate':
        if (action.partId && action.newState) {
          const part = this.parts.find(p => p.id === action.partId);
          if (part) {
            this.movePart(part, action.newState.x, action.newState.y);
            this.rotatePart(part, action.newState.rotation);
          }
        }
        break;
    }
  }

  canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  loadLevel(levelId: string): void {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;
    
    this.currentLevel = level;
    this.reset();
    
    level.fixedParts.forEach(serialized => {
      const part = PartFactory.deserializePart(serialized);
      this.addPartToWorld(part);
      this.parts.push(part);
    });
    
    this.historyManager.clear();
    this.setGameState('editing');
  }

  getCurrentLevel(): Level | undefined {
    return this.currentLevel;
  }

  getLevels(): Level[] {
    return levels;
  }

  getToolDefinitions(): typeof toolDefinitions {
    return toolDefinitions;
  }

  reset(): void {
    this.parts.forEach(part => this.removePartFromWorld(part));
    this.parts = [];
    
    if (this.marble) {
      this.physicsEngine.removeBody(this.marble);
      this.marble = undefined;
    }
    
    this.physicsEngine.stop();
    this.historyManager.clear();
    this.setGameState('editing');
  }

  start(): void {
    if (!this.currentLevel) return;
    
    this.deselectAllParts();
    this.createMarble();
    this.physicsEngine.start();
    this.setGameState('running');
  }

  stop(): void {
    this.physicsEngine.stop();
    
    if (this.marble) {
      this.physicsEngine.removeBody(this.marble);
      this.marble = undefined;
    }
    
    this.setGameState('editing');
  }

  private createMarble(): void {
    if (!this.currentLevel) return;
    
    this.marble = Matter.Bodies.circle(
      this.currentLevel.startPosition.x,
      this.currentLevel.startPosition.y,
      15,
      {
        density: 0.002,
        friction: 0.1,
        restitution: 0.3,
        frictionAir: 0.01
      }
    );
    
    this.physicsEngine.addBody(this.marble);
  }

  private setGameState(state: GameState): void {
    this.gameState = state;
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  setStateChangeCallback(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  private checkWinCondition(): void {
    if (!this.currentLevel || !this.marble) return;
    
    const endPos = this.currentLevel.endPosition;
    const endSize = this.currentLevel.endSize;
    
    const marblePos = this.marble.position;
    
    if (
      marblePos.x > endPos.x - endSize.width / 2 &&
      marblePos.x < endPos.x + endSize.width / 2 &&
      marblePos.y > endPos.y - endSize.height / 2 &&
      marblePos.y < endPos.y + endSize.height / 2
    ) {
      this.physicsEngine.stop();
      this.setGameState('won');
      return;
    }
    
    const boundaries = this.currentLevel.boundaries;
    if (
      marblePos.x < boundaries.left - 50 ||
      marblePos.x > boundaries.right + 50 ||
      marblePos.y > boundaries.bottom + 50
    ) {
      this.physicsEngine.stop();
      this.setGameState('lost');
    }
  }

  private updateSpecialEffects(): void {
    if (!this.marble) return;
    
    this.parts.forEach(part => {
      switch (part.type) {
        case 'spring':
          this.updateSpring(part);
          break;
        case 'conveyor':
          this.updateConveyor(part);
          break;
        case 'speed_ring':
          this.updateSpeedRing(part);
          break;
        case 'fan':
          this.updateFan(part);
          break;
        case 'balloon':
          this.updateBalloon(part);
          break;
      }
    });
  }

  private updateSpring(part: Part): void {
    if (!this.marble || part.bodies.length < 2) return;
    
    const platform = part.bodies[1];
    const bounceForce = part.data?.bounceForce || 0.01;
    
    const collision = Matter.Collision.collides(this.marble, platform);
    if (collision && this.marble.velocity.y > 0) {
      Matter.Body.setVelocity(this.marble, {
        x: this.marble.velocity.x * 0.8,
        y: -Math.abs(this.marble.velocity.y) * 1.5
      });
      
      Matter.Body.applyForce(this.marble, this.marble.position, {
        x: 0,
        y: -bounceForce
      });
    }
  }

  private updateConveyor(part: Part): void {
    if (!this.marble || part.bodies.length === 0) return;
    
    const conveyorBody = part.bodies[0];
    const speed = part.data?.speed || 5;
    
    const collision = Matter.Collision.collides(this.marble, conveyorBody);
    if (collision) {
      const direction = { x: Math.cos(conveyorBody.angle), y: Math.sin(conveyorBody.angle) };
      Matter.Body.applyForce(this.marble, this.marble.position, {
        x: direction.x * speed * 0.0001,
        y: direction.y * speed * 0.0001
      });
    }
  }

  private updateSpeedRing(part: Part): void {
    if (!this.marble || part.bodies.length === 0) return;
    
    const ringBody = part.bodies[0];
    const boostForce = part.data?.boostForce || 0.015;
    
    const collision = Matter.Collision.collides(this.marble, ringBody);
    if (collision && !part.data?.triggered) {
      const velocity = this.marble.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      if (speed > 0.1) {
        const normalizedVelocity = {
          x: velocity.x / speed,
          y: velocity.y / speed
        };
        
        Matter.Body.applyForce(this.marble, this.marble.position, {
          x: normalizedVelocity.x * boostForce,
          y: normalizedVelocity.y * boostForce
        });
      }
      
      part.data = { ...part.data, triggered: true };
      
      setTimeout(() => {
        if (part.data) {
          part.data.triggered = false;
        }
      }, 500);
    }
  }

  private updateFan(part: Part): void {
    if (!this.marble || part.bodies.length === 0) return;
    
    const fanBody = part.bodies[0];
    const windForce = part.data?.windForce || 0.003;
    const range = part.data?.range || 150;
    
    const dx = this.marble.position.x - fanBody.position.x;
    const dy = this.marble.position.y - fanBody.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < range) {
      const windDirection = {
        x: Math.cos(fanBody.angle - Math.PI / 2),
        y: Math.sin(fanBody.angle - Math.PI / 2)
      };
      
      const falloff = 1 - distance / range;
      
      Matter.Body.applyForce(this.marble, this.marble.position, {
        x: windDirection.x * windForce * falloff,
        y: windDirection.y * windForce * falloff
      });
    }
  }

  private updateBalloon(part: Part): void {
    if (part.bodies.length === 0) return;
    
    const balloonBody = part.bodies[0];
    const buoyancy = part.data?.buoyancy || -0.0008;
    
    Matter.Body.applyForce(balloonBody, balloonBody.position, {
      x: 0,
      y: buoyancy
    });
    
    if (this.marble) {
      const collision = Matter.Collision.collides(this.marble, balloonBody);
      if (collision) {
        Matter.Body.applyForce(this.marble, this.marble.position, {
          x: 0,
          y: buoyancy * 0.5
        });
      }
    }
  }

  private startGameLoop(): void {
    const gameLoop = (timestamp: number) => {
      this.physicsEngine.update(timestamp);
      
      if (this.gameState === 'running') {
        this.updateSpecialEffects();
        this.checkWinCondition();
      }
      
      this.render();
      
      this.animationId = requestAnimationFrame(gameLoop);
    };
    
    this.animationId = requestAnimationFrame(gameLoop);
  }

  private render(): void {
    this.renderer.clear();
    
    if (this.currentLevel) {
      this.renderer.drawBoundaries(this.currentLevel.boundaries);
      this.renderer.drawStartPosition(
        this.currentLevel.startPosition.x,
        this.currentLevel.startPosition.y
      );
      this.renderer.drawEndPosition(
        this.currentLevel.endPosition.x,
        this.currentLevel.endPosition.y,
        this.currentLevel.endSize.width,
        this.currentLevel.endSize.height
      );
    }
    
    this.parts.forEach(part => {
      this.renderer.drawPart(part, this.gameState === 'running');
    });
    
    if (this.marble) {
      this.renderer.drawMarble(this.marble);
    }
    
    if (this.dragState.isDragging && this.dragState.isNewPart && this.dragState.newPartType) {
      this.renderer.drawSnapIndicator(
        Math.round(this.mousePosition.x / this.snapGridSize) * this.snapGridSize,
        Math.round(this.mousePosition.y / this.snapGridSize) * this.snapGridSize
      );
    }
  }

  exportLevel(): SerializedLevel | null {
    if (!this.currentLevel) return null;
    
    return {
      id: this.currentLevel.id,
      name: this.currentLevel.name,
      description: this.currentLevel.description,
      startPosition: { ...this.currentLevel.startPosition },
      endPosition: { ...this.currentLevel.endPosition },
      endSize: { ...this.currentLevel.endSize },
      boundaries: { ...this.currentLevel.boundaries },
      parts: this.parts.map(part => PartFactory.serializePart(part))
    };
  }

  importLevel(serialized: SerializedLevel): void {
    this.reset();
    
    this.currentLevel = {
      id: serialized.id,
      name: serialized.name,
      description: serialized.description,
      startPosition: serialized.startPosition,
      endPosition: serialized.endPosition,
      endSize: serialized.endSize,
      boundaries: serialized.boundaries,
      fixedParts: [],
      availableTools: ['wood_plank', 'spring', 'conveyor', 'speed_ring', 'seesaw', 'balloon', 'fan']
    };
    
    serialized.parts.forEach(serializedPart => {
      const part = PartFactory.deserializePart(serializedPart);
      this.addPartToWorld(part);
      this.parts.push(part);
    });
    
    this.setGameState('editing');
  }

  destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.physicsEngine.destroy();
  }
}
