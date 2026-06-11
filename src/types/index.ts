export type Tier = 'common' | 'rare' | 'epic' | 'legendary'
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
export type SortMode = 'auto' | 'manual'

export interface Quest {
  id: string
  title: string
  tier: Tier
  dueDate?: string
  completed: boolean
  completedAt?: string
  pinnedToday: boolean
  order: number
  createdAt: string
}

export interface Character {
  name: string
  xp: number
  level: number
  questsDone: number
  sessionsDone: number
  streak: number
  lastActiveDate: string
  xpToday: number
}
