export type CaseType = 'theft' | 'murder' | 'fraud' | 'arson';

export type EvidenceType = 'physical' | 'testimony' | 'forensic';

export type CharacterRole = 'victim' | 'suspect' | 'witness' | 'culprit';

export type RelationshipType = 'friend' | 'enemy' | 'family' | 'colleague' | 'stranger';

export type GamePhase = 'menu' | 'investigation' | 'trial' | 'verdict';

export type LocationType = 'crime_scene' | 'police_archive' | 'forensics_lab' | 'witness_home' | 'hospital' | 'bank';

export interface Relationship {
  targetId: string;
  type: RelationshipType;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  alibi: string;
  motives: string[];
  relationships: Relationship[];
}

export interface TimelineEvent {
  time: string;
  location: string;
  characterId: string;
  action: string;
  isTruth: boolean;
}

export interface Evidence {
  id: string;
  name: string;
  type: EvidenceType;
  reliability: number;
  description: string;
  location: string;
  discovered: boolean;
  canContradict: string[];
  contradictions: string[];
}

export interface Testimony {
  id: string;
  statement: string;
  isTrue: boolean;
  canBeContradicted: boolean;
  contradictedBy: string[];
  revealed: boolean;
}

export interface Witness {
  characterId: string;
  testimony: Testimony[];
  isHostile: boolean;
  hiddenAgenda: string;
}

export interface CaseTruth {
  realCulprit: string;
  motive: string;
  keyEvidenceChain: string[];
  hiddenDetails: string[];
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  evidenceIds: string[];
  characterIds: string[];
  actionPointCost: number;
}

export interface Case {
  id: string;
  type: CaseType;
  title: string;
  description: string;
  truth: CaseTruth;
  timeline: TimelineEvent[];
  characters: Character[];
  evidence: Evidence[];
  witnesses: Witness[];
  locations: Location[];
  difficulty: number;
}

export interface TrialEvent {
  type: 'testimony' | 'objection' | 'objection_result' | 'surprise';
  content: string;
  timestamp: number;
  success?: boolean;
}

export interface GameState {
  currentPhase: GamePhase;
  currentCase: Case | null;
  actionPoints: number;
  maxActionPoints: number;
  discoveredEvidence: string[];
  visitedLocations: string[];
  interviewedWitnesses: string[];
  juryInclination: number;
  judgeTrust: number;
  objectionsRemaining: number;
  currentWitnessIndex: number;
  currentTestimonyIndex: number;
  trialLog: TrialEvent[];
  showEvidenceBook: boolean;
  selectedEvidenceId: string | null;
  currentLocationId: string | null;
}

export interface GameActions {
  startNewCase: () => void;
  goToInvestigation: () => void;
  goToTrial: () => void;
  visitLocation: (locationId: string) => void;
  collectEvidence: (evidenceId: string) => void;
  interviewWitness: (characterId: string) => void;
  presentObjection: (evidenceId: string, testimonyId: string) => void;
  advanceTestimony: () => void;
  nextWitness: () => void;
  toggleEvidenceBook: () => void;
  selectEvidence: (evidenceId: string | null) => void;
  returnToMenu: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;
