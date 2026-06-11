import { useState, useCallback, useMemo } from 'react'
import type { Quest, Tier, SortMode } from '../types'
import { TIER_XP } from '../constants'

const KEY = 'ql_quests'

const TIER_WEIGHT: Record<Tier, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
}

function load(): Quest[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(quests: Quest[]) {
  localStorage.setItem(KEY, JSON.stringify(quests))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function duePriority(dueDate?: string): number {
  if (!dueDate) return 0
  const today = todayStr()
  if (dueDate < today) return 3
  if (dueDate === today) return 2
  return 1
}

export function useTasks() {
  const [quests, setQuests] = useState<Quest[]>(load)
  const [sortMode, setSortMode] = useState<SortMode>('auto')
  const [filter, setFilter] = useState<Tier | 'all'>('all')

  const addQuest = useCallback((title: string, tier: Tier, dueDate?: string) => {
    const quest: Quest = {
      id: crypto.randomUUID(),
      title: title.trim(),
      tier,
      dueDate: dueDate || undefined,
      completed: false,
      pinnedToday: false,
      order: Date.now(),
      createdAt: new Date().toISOString(),
    }
    setQuests(prev => {
      const next = [...prev, quest]
      save(next)
      return next
    })
  }, [])

  const completeQuest = useCallback((id: string): number => {
    const quest = quests.find(q => q.id === id)
    const xp = quest ? TIER_XP[quest.tier] : 0
    setQuests(prev => {
      const next = prev.map(q =>
        q.id === id
          ? { ...q, completed: true, completedAt: new Date().toISOString(), pinnedToday: false }
          : q
      )
      save(next)
      return next
    })
    return xp
  }, [quests])

  const deleteQuest = useCallback((id: string) => {
    setQuests(prev => {
      const next = prev.filter(q => q.id !== id)
      save(next)
      return next
    })
  }, [])

  const pinToday = useCallback((id: string) => {
    setQuests(prev => {
      const next = prev.map(q => q.id === id ? { ...q, pinnedToday: !q.pinnedToday } : q)
      save(next)
      return next
    })
  }, [])

  const moveUp = useCallback((id: string, list: Quest[]) => {
    const idx = list.findIndex(q => q.id === id)
    if (idx <= 0) return
    setQuests(prev => {
      const next = [...prev]
      const aIdx = next.findIndex(q => q.id === list[idx].id)
      const bIdx = next.findIndex(q => q.id === list[idx - 1].id)
      const tempOrder = next[aIdx].order
      next[aIdx] = { ...next[aIdx], order: next[bIdx].order }
      next[bIdx] = { ...next[bIdx], order: tempOrder }
      save(next)
      return next
    })
  }, [])

  const moveDown = useCallback((id: string, list: Quest[]) => {
    const idx = list.findIndex(q => q.id === id)
    if (idx >= list.length - 1) return
    setQuests(prev => {
      const next = [...prev]
      const aIdx = next.findIndex(q => q.id === list[idx].id)
      const bIdx = next.findIndex(q => q.id === list[idx + 1].id)
      const tempOrder = next[aIdx].order
      next[aIdx] = { ...next[aIdx], order: next[bIdx].order }
      next[bIdx] = { ...next[bIdx], order: tempOrder }
      save(next)
      return next
    })
  }, [])

  const today = todayStr()

  const { todayQuests, backlogQuests, completedQuests, suggestions } = useMemo(() => {
    const active = quests.filter(q => !q.completed)
    const completed = [...quests.filter(q => q.completed)].sort(
      (a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
    )

    const isToday = (q: Quest) =>
      q.pinnedToday || q.dueDate === today || (!!q.dueDate && q.dueDate < today)

    const todayActive = active.filter(isToday)
    const backlog = active.filter(q => !isToday(q))

    const autoSort = (list: Quest[]) =>
      [...list].sort((a, b) => {
        const d = duePriority(b.dueDate) - duePriority(a.dueDate)
        if (d !== 0) return d
        const t = TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier]
        if (t !== 0) return t
        return a.order - b.order
      })

    const manualSort = (list: Quest[]) => [...list].sort((a, b) => a.order - b.order)
    const sort = sortMode === 'auto' ? autoSort : manualSort
    const applyFilter = (list: Quest[]) => filter === 'all' ? list : list.filter(q => q.tier === filter)

    const suggestions = todayActive.length === 0 ? autoSort(backlog).slice(0, 3) : []

    return {
      todayQuests: sort(applyFilter(todayActive)),
      backlogQuests: sort(applyFilter(backlog)),
      completedQuests: completed,
      suggestions,
    }
  }, [quests, sortMode, filter, today])

  const hasAnything = quests.length > 0
  const allDone = quests.length > 0 && quests.every(q => q.completed)

  return {
    quests,
    todayQuests,
    backlogQuests,
    completedQuests,
    suggestions,
    hasAnything,
    allDone,
    sortMode,
    setSortMode,
    filter,
    setFilter,
    addQuest,
    completeQuest,
    deleteQuest,
    pinToday,
    moveUp,
    moveDown,
  }
}
