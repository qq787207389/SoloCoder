export interface Participant {
  id: string;
  name: string;
  phone: string;
  phoneLastFour: string;
  avatar: string;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  participantId: string;
  participant: Participant;
  checkedInAt: string;
}

export interface PrizeLevel {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface PrizeSetting {
  levels: PrizeLevel[];
}

export interface Winner {
  id: string;
  participantId: string;
  participant: Participant;
  prizeLevelId: string;
  prizeLevelName: string;
  wonAt: string;
}

export interface Danmaku {
  id: string;
  participantId: string;
  participantName: string;
  content: string;
  color: string;
  sentAt: string;
}

export interface Activity {
  id: string;
  name: string;
  code: string;
  status: 'preparing' | 'ongoing' | 'finished';
  createdAt: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
