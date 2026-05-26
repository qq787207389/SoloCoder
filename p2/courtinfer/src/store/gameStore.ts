import { create } from 'zustand';
import type { GameStore, GameState, TrialEvent } from '../types';
import { generateRandomCase, initializeCaseForGame } from '../systems/caseGenerator';
import { checkContradiction, calculateObjectionImpact } from '../systems/contradictionEngine';

const initialState: GameState = {
  currentPhase: 'menu',
  currentCase: null,
  actionPoints: 10,
  maxActionPoints: 10,
  discoveredEvidence: [],
  visitedLocations: [],
  interviewedWitnesses: [],
  juryInclination: -30,
  judgeTrust: 80,
  objectionsRemaining: 5,
  currentWitnessIndex: 0,
  currentTestimonyIndex: 0,
  trialLog: [],
  showEvidenceBook: false,
  selectedEvidenceId: null,
  currentLocationId: null
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startNewCase: () => {
    const newCase = initializeCaseForGame(generateRandomCase());
    set({
      ...initialState,
      currentPhase: 'investigation',
      currentCase: newCase,
      actionPoints: 10 + Math.floor(newCase.difficulty * 2),
      maxActionPoints: 10 + Math.floor(newCase.difficulty * 2)
    });
  },

  goToInvestigation: () => {
    set({ currentPhase: 'investigation' });
  },

  goToTrial: () => {
    const state = get();
    if (state.currentCase) {
      const firstWitness = state.currentCase.witnesses[0];
      if (firstWitness && firstWitness.testimony.length > 0) {
        const event: TrialEvent = {
          type: 'testimony',
          content: `${state.currentCase.characters.find(c => c.id === firstWitness.characterId)?.name}出庭作证`,
          timestamp: Date.now()
        };
        set({
          currentPhase: 'trial',
          currentWitnessIndex: 0,
          currentTestimonyIndex: 0,
          trialLog: [event]
        });
      }
    }
  },

  visitLocation: (locationId: string) => {
    const state = get();
    const location = state.currentCase?.locations.find(l => l.id === locationId);
    
    if (!location || state.actionPoints < location.actionPointCost) {
      return;
    }

    const newVisited = state.visitedLocations.includes(locationId)
      ? state.visitedLocations
      : [...state.visitedLocations, locationId];

    set({
      actionPoints: state.actionPoints - location.actionPointCost,
      visitedLocations: newVisited,
      currentLocationId: locationId
    });
  },

  collectEvidence: (evidenceId: string) => {
    const state = get();
    if (!state.currentCase || state.discoveredEvidence.includes(evidenceId)) {
      return;
    }

    const evidence = state.currentCase.evidence.find(e => e.id === evidenceId);
    if (!evidence) {
      return;
    }

    const updatedCase = {
      ...state.currentCase,
      evidence: state.currentCase.evidence.map(e =>
        e.id === evidenceId ? { ...e, discovered: true } : e
      )
    };

    set({
      currentCase: updatedCase,
      discoveredEvidence: [...state.discoveredEvidence, evidenceId]
    });
  },

  interviewWitness: (characterId: string) => {
    const state = get();
    if (!state.currentCase || state.interviewedWitnesses.includes(characterId)) {
      return;
    }

    set({
      interviewedWitnesses: [...state.interviewedWitnesses, characterId]
    });
  },

  presentObjection: (evidenceId: string, testimonyId: string) => {
    const state = get();
    if (!state.currentCase || state.objectionsRemaining <= 0) {
      return;
    }

    const evidence = state.currentCase.evidence.find(e => e.id === evidenceId);
    const currentWitness = state.currentCase.witnesses[state.currentWitnessIndex];
    const testimony = currentWitness?.testimony.find(t => t.id === testimonyId);

    if (!evidence || !testimony || !evidence.discovered) {
      return;
    }

    const contradictionResult = checkContradiction(evidence, testimony);
    const { juryChange, judgeChange } = calculateObjectionImpact(
      contradictionResult,
      state.juryInclination,
      state.judgeTrust
    );

    const objectionEvent: TrialEvent = {
      type: 'objection',
      content: `使用证据"${evidence.name}"对证词提出异议`,
      timestamp: Date.now()
    };

    const resultEvent: TrialEvent = {
      type: 'objection_result',
      content: contradictionResult.canContradict 
        ? `异议成立！陪审团倾向改变 ${juryChange > 0 ? '+' : ''}${juryChange}`
        : '异议无效。法官信任度下降',
      timestamp: Date.now(),
      success: contradictionResult.canContradict
    };

    const updatedWitnesses = state.currentCase.witnesses.map((w, idx) => {
      if (idx !== state.currentWitnessIndex) return w;
      return {
        ...w,
        testimony: w.testimony.map(t =>
          t.id === testimonyId ? { ...t, revealed: true } : t
        )
      };
    });

    set({
      currentCase: {
        ...state.currentCase,
        witnesses: updatedWitnesses
      },
      objectionsRemaining: state.objectionsRemaining - 1,
      juryInclination: Math.max(-100, Math.min(100, state.juryInclination + juryChange)),
      judgeTrust: Math.max(0, Math.min(100, state.judgeTrust + judgeChange)),
      trialLog: [...state.trialLog, objectionEvent, resultEvent],
      showEvidenceBook: false,
      selectedEvidenceId: null
    });

    if (state.judgeTrust + judgeChange <= 0) {
      setTimeout(() => {
        set({ currentPhase: 'verdict' });
      }, 1500);
    }
  },

  advanceTestimony: () => {
    const state = get();
    if (!state.currentCase) return;

    const currentWitness = state.currentCase.witnesses[state.currentWitnessIndex];
    if (!currentWitness) return;

    const nextTestimonyIndex = state.currentTestimonyIndex + 1;
    
    if (nextTestimonyIndex >= currentWitness.testimony.length) {
      get().nextWitness();
      return;
    }

    const newTestimony = currentWitness.testimony[nextTestimonyIndex];
    const event: TrialEvent = {
      type: 'testimony',
      content: newTestimony.statement,
      timestamp: Date.now()
    };

    const updatedWitnesses = state.currentCase.witnesses.map((w, idx) => {
      if (idx !== state.currentWitnessIndex) return w;
      return {
        ...w,
        testimony: w.testimony.map((t, tIdx) =>
          tIdx === nextTestimonyIndex ? { ...t, revealed: true } : t
        )
      };
    });

    set({
      currentCase: {
        ...state.currentCase,
        witnesses: updatedWitnesses
      },
      currentTestimonyIndex: nextTestimonyIndex,
      trialLog: [...state.trialLog, event]
    });
  },

  nextWitness: () => {
    const state = get();
    if (!state.currentCase) return;

    const nextWitnessIndex = state.currentWitnessIndex + 1;
    
    if (nextWitnessIndex >= state.currentCase.witnesses.length) {
      set({ currentPhase: 'verdict' });
      return;
    }

    const nextWitness = state.currentCase.witnesses[nextWitnessIndex];
    const witnessName = state.currentCase.characters.find(c => c.id === nextWitness.characterId)?.name || '证人';
    
    const event: TrialEvent = {
      type: 'testimony',
      content: `${witnessName}出庭作证`,
      timestamp: Date.now()
    };

    const updatedWitnesses = state.currentCase.witnesses.map((w, idx) => {
      if (idx !== nextWitnessIndex) return w;
      return {
        ...w,
        testimony: w.testimony.map((t, tIdx) =>
          tIdx === 0 ? { ...t, revealed: true } : t
        )
      };
    });

    set({
      currentCase: {
        ...state.currentCase,
        witnesses: updatedWitnesses
      },
      currentWitnessIndex: nextWitnessIndex,
      currentTestimonyIndex: 0,
      trialLog: [...state.trialLog, event]
    });
  },

  toggleEvidenceBook: () => {
    set(state => ({ showEvidenceBook: !state.showEvidenceBook }));
  },

  selectEvidence: (evidenceId: string | null) => {
    set({ selectedEvidenceId: evidenceId });
  },

  returnToMenu: () => {
    set({ ...initialState });
  },

  resetGame: () => {
    set({ ...initialState });
  }
}));
