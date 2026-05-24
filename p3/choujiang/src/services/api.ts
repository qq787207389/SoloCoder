import type {
  Participant,
  CheckInRecord,
  Winner,
  Danmaku,
  Activity,
  PrizeSetting,
  ApiResponse,
} from '../types';

const BASE_URL = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || '请求失败');
  }
  return data.data;
}

export const api = {
  getActivity: (): Promise<Activity> => request('/activity'),

  createActivity: (name: string): Promise<Activity> =>
    request('/activity', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getParticipants: (): Promise<Participant[]> => request('/participants'),

  addParticipant: (name: string, phone: string): Promise<Participant> =>
    request('/participants', {
      method: 'POST',
      body: JSON.stringify({ name, phone }),
    }),

  batchAddParticipants: (
    participants: Array<{ name: string; phone: string }>
  ): Promise<Participant[]> =>
    request('/participants/batch', {
      method: 'POST',
      body: JSON.stringify({ participants }),
    }),

  getCheckIns: (): Promise<CheckInRecord[]> => request('/checkins'),

  checkIn: (name: string, phoneLastFour: string): Promise<CheckInRecord> =>
    request('/checkins', {
      method: 'POST',
      body: JSON.stringify({ name, phoneLastFour }),
    }),

  manualCheckIn: (participantId: string): Promise<CheckInRecord> =>
    request('/checkins/manual', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }),

  deleteCheckIn: (id: string): Promise<void> =>
    request(`/checkins/${id}`, { method: 'DELETE' }),

  getPrizeSetting: (): Promise<PrizeSetting> => request('/prize-setting'),

  updatePrizeSetting: (setting: PrizeSetting): Promise<PrizeSetting> =>
    request('/prize-setting', {
      method: 'POST',
      body: JSON.stringify(setting),
    }),

  getWinners: (): Promise<Winner[]> => request('/winners'),

  drawLottery: (prizeLevelId: string, count: number): Promise<Winner[]> =>
    request('/lottery/draw', {
      method: 'POST',
      body: JSON.stringify({ prizeLevelId, count }),
    }),

  getDanmakus: (): Promise<Danmaku[]> => request('/danmakus'),

  sendDanmaku: (participantId: string, content: string): Promise<Danmaku> =>
    request('/danmakus', {
      method: 'POST',
      body: JSON.stringify({ participantId, content }),
    }),
};
