import { create } from 'zustand';
import type {
  Participant,
  CheckInRecord,
  PrizeSetting,
  Winner,
  Danmaku,
  Activity,
} from '../types';

interface AppState {
  activity: Activity | null;
  participants: Participant[];
  checkIns: CheckInRecord[];
  winners: Winner[];
  danmakus: Danmaku[];
  prizeSetting: PrizeSetting;
  isLotteryRunning: boolean;
  currentLotteryLevel: string | null;

  setActivity: (activity: Activity) => void;
  addParticipant: (participant: Participant) => void;
  setParticipants: (participants: Participant[]) => void;
  addCheckIn: (checkIn: CheckInRecord) => void;
  removeCheckIn: (checkInId: string) => void;
  setCheckIns: (checkIns: CheckInRecord[]) => void;
  addWinner: (winner: Winner) => void;
  setWinners: (winners: Winner[]) => void;
  addDanmaku: (danmaku: Danmaku) => void;
  setDanmakus: (danmakus: Danmaku[]) => void;
  setPrizeSetting: (setting: PrizeSetting) => void;
  setIsLotteryRunning: (running: boolean) => void;
  setCurrentLotteryLevel: (levelId: string | null) => void;
  resetLottery: () => void;
}

const defaultPrizeSetting: PrizeSetting = {
  levels: [
    { id: '1', name: '一等奖', count: 1, color: '#FFD700' },
    { id: '2', name: '二等奖', count: 3, color: '#C0C0C0' },
    { id: '3', name: '三等奖', count: 5, color: '#CD7F32' },
  ],
};

export const useStore = create<AppState>((set) => ({
  activity: null,
  participants: [],
  checkIns: [],
  winners: [],
  danmakus: [],
  prizeSetting: defaultPrizeSetting,
  isLotteryRunning: false,
  currentLotteryLevel: null,

  setActivity: (activity) => set({ activity }),
  addParticipant: (participant) =>
    set((state) => ({ participants: [...state.participants, participant] })),
  setParticipants: (participants) => set({ participants }),
  addCheckIn: (checkIn) =>
    set((state) => ({ checkIns: [...state.checkIns, checkIn] })),
  removeCheckIn: (checkInId) =>
    set((state) => ({
      checkIns: state.checkIns.filter((c) => c.id !== checkInId),
    })),
  setCheckIns: (checkIns) => set({ checkIns }),
  addWinner: (winner) =>
    set((state) => ({ winners: [...state.winners, winner] })),
  setWinners: (winners) => set({ winners }),
  addDanmaku: (danmaku) =>
    set((state) => ({ danmakus: [...state.danmakus, danmaku] })),
  setDanmakus: (danmakus) => set({ danmakus }),
  setPrizeSetting: (prizeSetting) => set({ prizeSetting }),
  setIsLotteryRunning: (isLotteryRunning) => set({ isLotteryRunning }),
  setCurrentLotteryLevel: (currentLotteryLevel) => set({ currentLotteryLevel }),
  resetLottery: () =>
    set({ isLotteryRunning: false, currentLotteryLevel: null }),
}));
