
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Mech, Part, PlayerSave, BattleState, PartType, BattleLogEntry } from '../types';
import { createStarterMech, equipPart, unequipPart, validateAssembly } from '../utils/assembly';
import { getPartById, getStarterParts, ALL_PARTS } from '../data/parts';

interface GameState {
  currentPage: 'menu' | 'workshop' | 'battle' | 'shop' | 'career' | 'hangar';
  playerSave: PlayerSave | null;
  currentMech: Mech;
  selectedPartType: PartType | null;
  battleState: BattleState | null;
  isBattleAnimating: boolean;
  setCurrentPage: (page: GameState['currentPage']) => void;
  newGame: (playerName: string) => void;
  loadGame: (saveId: string) => void;
  saveGame: () => void;
  equipPartToMech: (partId: string) => void;
  unequipPartFromMech: (partType: PartType) => void;
  setSelectedPartType: (type: PartType | null) => void;
  setBattleState: (state: BattleState | null) => void;
  setBattleAnimating: (animating: boolean) => void;
  buyPart: (partId: string) => boolean;
  sellPart: (partId: string) => boolean;
  addBattleResult: (log: BattleLogEntry) => void;
  getAvailableParts: () => Part[];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentPage: 'menu',
      playerSave: null,
      currentMech: createStarterMech(),
      selectedPartType: null,
      battleState: null,
      isBattleAnimating: false,

      setCurrentPage: (page) => set({ currentPage: page }),

      newGame: (playerName: string) => {
        const starterMech = createStarterMech();
        const newSave: PlayerSave = {
          id: `save_${Date.now()}`,
          name: playerName,
          credits: 5000,
          reputation: 0,
          currentTier: 1,
          ownedParts: [],
          currentMech: starterMech,
          battleHistory: [],
          unlockedTiers: [1],
        };
        set({ playerSave: newSave, currentMech: starterMech, currentPage: 'workshop' });
      },

      loadGame: (saveId: string) => {
        const saves = localStorage.getItem('mech-game-saves');
        if (saves) {
          const allSaves = JSON.parse(saves);
          const save = allSaves.find((s: PlayerSave) => s.id === saveId);
          if (save) {
            set({ playerSave: save, currentMech: save.currentMech, currentPage: 'workshop' });
          }
        }
      },

      saveGame: () => {
        const { playerSave, currentMech } = get();
        if (playerSave) {
          const updatedSave = { ...playerSave, currentMech };
          const saves = localStorage.getItem('mech-game-saves');
          const allSaves = saves ? JSON.parse(saves) : [];
          const existingIndex = allSaves.findIndex((s: PlayerSave) => s.id === playerSave.id);
          if (existingIndex >= 0) {
            allSaves[existingIndex] = updatedSave;
          } else {
            allSaves.push(updatedSave);
          }
          localStorage.setItem('mech-game-saves', JSON.stringify(allSaves));
          set({ playerSave: updatedSave });
        }
      },

      equipPartToMech: (partId: string) => {
        const part = getPartById(partId);
        if (!part) return;

        const { currentMech, playerSave } = get();
        const newMech = equipPart(currentMech, part);

        if (playerSave) {
          const removeIndex = playerSave.ownedParts.indexOf(partId);
          const newOwnedParts = [...playerSave.ownedParts];
          if (removeIndex >= 0) {
            newOwnedParts.splice(removeIndex, 1);
          }
          const oldPart = currentMech.parts[part.type];
          if (oldPart) {
            newOwnedParts.push(oldPart.id);
          }
          set({
            currentMech: newMech,
            playerSave: { ...playerSave, ownedParts: newOwnedParts, currentMech: newMech },
          });
        } else {
          set({ currentMech: newMech });
        }
      },

      unequipPartFromMech: (partType: PartType) => {
        const { currentMech, playerSave } = get();
        const part = currentMech.parts[partType];
        if (!part) return;

        const newMech = unequipPart(currentMech, partType);

        if (playerSave) {
          const newOwnedParts = [...playerSave.ownedParts, part.id];
          set({
            currentMech: newMech,
            playerSave: { ...playerSave, ownedParts: newOwnedParts, currentMech: newMech },
          });
        } else {
          set({ currentMech: newMech });
        }
      },

      setSelectedPartType: (type) => set({ selectedPartType: type }),

      setBattleState: (state) => set({ battleState: state }),

      setBattleAnimating: (animating) => set({ isBattleAnimating: animating }),

      buyPart: (partId: string) => {
        const part = getPartById(partId);
        const { playerSave } = get();

        if (!part || !playerSave || playerSave.credits < part.price) {
          return false;
        }

        const newSave = {
          ...playerSave,
          credits: playerSave.credits - part.price,
          ownedParts: [...playerSave.ownedParts, partId],
        };

        set({ playerSave: newSave });
        return true;
      },

      sellPart: (partId: string) => {
        const part = getPartById(partId);
        const { playerSave } = get();

        if (!part || !playerSave || !playerSave.ownedParts.includes(partId)) {
          return false;
        }

        const sellPrice = Math.floor(part.price * 0.5);
        const removeIndex = playerSave.ownedParts.indexOf(partId);
        const newOwnedParts = [...playerSave.ownedParts];
        newOwnedParts.splice(removeIndex, 1);

        const newSave = {
          ...playerSave,
          credits: playerSave.credits + sellPrice,
          ownedParts: newOwnedParts,
        };

        set({ playerSave: newSave });
        return true;
      },

      addBattleResult: (log: BattleLogEntry) => {
        const { playerSave } = get();
        if (!playerSave) return;

        const newSave = {
          ...playerSave,
          credits: playerSave.credits + (log.won ? log.creditsEarned : 0),
          reputation: playerSave.reputation + (log.won ? 10 : 2),
          battleHistory: [...playerSave.battleHistory, log],
        };

        set({ playerSave: newSave });
      },

      getAvailableParts: () => {
        const { playerSave } = get();
        if (!playerSave) return [];
        return playerSave.ownedParts.map((id) => getPartById(id)).filter((p): p is Part => p !== undefined);
      },
    }),
    {
      name: 'mech-game-storage',
      partialize: (state) => ({
        playerSave: state.playerSave,
        currentMech: state.currentMech,
      }),
    }
  )
);

export { validateAssembly };
