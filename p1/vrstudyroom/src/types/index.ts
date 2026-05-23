export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: number
  completedAt?: number
}

export type PomodoroMode = 'focus' | 'break'

export interface PomodoroSettings {
  focusDuration: number
  breakDuration: number
}

export interface PomodoroState extends PomodoroSettings {
  mode: PomodoroMode
  remaining: number
  isRunning: boolean
  startTime?: number
  accumulatedFocus: number
}

export type NoiseId = 'rain' | 'library' | 'fire' | 'cafe'

export interface WhiteNoise {
  id: NoiseId
  name: string
  icon: string
  active: boolean
  volume: number
}

export interface StudyRecord {
  date: string
  focusMinutes: number
  completedTasks: number
}

export interface AppState {
  tasks: Task[]
  pomodoro: PomodoroState
  whiteNoise: WhiteNoise[]
  records: StudyRecord[]
  onlineCount: number
}
