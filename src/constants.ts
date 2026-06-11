import type { Tier } from './types'

export const TIER_XP: Record<Tier, number> = {
  common: 50,
  rare: 100,
  epic: 200,
  legendary: 400,
}

export const TIER_LABELS: Record<Tier, string> = {
  common: 'Low Priority',
  rare: 'Medium Priority',
  epic: 'High Priority',
  legendary: 'Critical',
}

export const XP_PER_LEVEL = (level: number) => 500 * level

export const TIMER_DURATIONS: Record<string, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}
