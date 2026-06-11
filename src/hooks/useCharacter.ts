import { useState, useCallback } from 'react'
import type { Character } from '../types'
import { XP_PER_LEVEL } from '../constants'

const KEY = 'ql_character'

const DEFAULT: Character = {
  name: 'Player',
  xp: 0,
  level: 1,
  questsDone: 0,
  sessionsDone: 0,
  streak: 0,
  lastActiveDate: '',
  xpToday: 0,
}

function load(): Character {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
  } catch {
    return DEFAULT
  }
}

function save(c: Character) {
  localStorage.setItem(KEY, JSON.stringify(c))
}

function calcLevel(totalXp: number): number {
  let xp = totalXp
  let level = 1
  while (xp >= XP_PER_LEVEL(level)) {
    xp -= XP_PER_LEVEL(level)
    level++
  }
  return level
}

function xpInCurrentLevel(totalXp: number, level: number): number {
  let xp = totalXp
  for (let l = 1; l < level; l++) xp -= XP_PER_LEVEL(l)
  return xp
}

export function useCharacter() {
  const [character, setCharacter] = useState<Character>(load)
  const [levelUpFlash, setLevelUpFlash] = useState(false)

  const addXp = useCallback((amount: number) => {
    setCharacter(prev => {
      const today = new Date().toDateString()
      const newXp = prev.xp + amount
      const newLevel = calcLevel(newXp)
      const leveledUp = newLevel > prev.level

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const wasYesterday = prev.lastActiveDate === yesterday.toDateString()
      const streak = prev.lastActiveDate === today ? prev.streak : (wasYesterday ? prev.streak + 1 : 1)

      const next: Character = {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak,
        lastActiveDate: today,
        xpToday: prev.lastActiveDate === today ? prev.xpToday + amount : amount,
      }
      save(next)
      if (leveledUp) setLevelUpFlash(true)
      return next
    })
  }, [])

  const addQuestDone = useCallback(() => {
    setCharacter(prev => {
      const next = { ...prev, questsDone: prev.questsDone + 1 }
      save(next)
      return next
    })
  }, [])

  const addSessionDone = useCallback(() => {
    setCharacter(prev => {
      const next = { ...prev, sessionsDone: prev.sessionsDone + 1 }
      save(next)
      return next
    })
  }, [])

  const setName = useCallback((name: string) => {
    setCharacter(prev => {
      const next = { ...prev, name }
      save(next)
      return next
    })
  }, [])

  const dismissLevelUp = useCallback(() => setLevelUpFlash(false), [])

  const xpInLevel = xpInCurrentLevel(character.xp, character.level)
  const xpNeeded = XP_PER_LEVEL(character.level)
  const xpPercent = Math.min((xpInLevel / xpNeeded) * 100, 100)

  return {
    character,
    addXp,
    addQuestDone,
    addSessionDone,
    setName,
    levelUpFlash,
    dismissLevelUp,
    xpInLevel,
    xpNeeded,
    xpPercent,
  }
}
