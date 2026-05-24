import { Body, Constraint } from 'matter-js';

export type PartType = 
  | 'wood_plank'
  | 'spring'
  | 'conveyor'
  | 'speed_ring'
  | 'seesaw'
  | 'balloon'
  | 'fan'
  | 'pin'
  | 'rope';

export interface Part {
  id: string;
  type: PartType;
  x: number;
  y: number;
  rotation: number;
  bodies: Body[];
  constraints: Constraint[];
  isStatic: boolean;
  isSelected: boolean;
  data?: Record<string, any>;
}

export interface PartDefinition {
  type: PartType;
  name: string;
  icon: string;
  width: number;
  height: number;
  isStatic: boolean;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  endSize: { width: number; height: number };
  boundaries: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  fixedParts: SerializedPart[];
  availableTools: PartType[];
  hint?: string;
}

export interface SerializedPart {
  id: string;
  type: PartType;
  x: number;
  y: number;
  rotation: number;
  isStatic: boolean;
  data?: Record<string, any>;
}

export interface SerializedLevel {
  id: string;
  name: string;
  description: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  endSize: { width: number; height: number };
  boundaries: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  parts: SerializedPart[];
}

export type GameState = 'editing' | 'running' | 'won' | 'lost';

export interface HistoryAction {
  type: 'add' | 'remove' | 'move' | 'rotate' | 'connect';
  partId?: string;
  serializedPart?: SerializedPart;
  oldState?: { x: number; y: number; rotation: number };
  newState?: { x: number; y: number; rotation: number };
}
