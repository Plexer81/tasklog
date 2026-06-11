import { useState, useEffect, useCallback, useRef } from 'react'
import type { TimerMode } from '../types'
import { TIMER_DURATIONS } from '../constants'

export function usePomodoro(onSessionComplete: () => void) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATIONS.focus)
  const [running, setRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  const stateRef = useRef({ mode, sessionCount, onSessionComplete })
  stateRef.current = { mode, sessionCount, onSessionComplete }

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev > 1) return prev - 1

        const { mode: m, sessionCount: sc, onSessionComplete: cb } = stateRef.current
        clearInterval(id)
        setRunning(false)

        if (m === 'focus') {
          const newCount = sc + 1
          setSessionCount(newCount)
          cb()
          const nextMode: TimerMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak'
          setMode(nextMode)
          return TIMER_DURATIONS[nextMode]
        } else {
          setMode('focus')
          return TIMER_DURATIONS.focus
        }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running) {
      document.title = 'TASKLOG'
      return
    }
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
    const s = (secondsLeft % 60).toString().padStart(2, '0')
    document.title = `${m}:${s} — TASKLOG`
  }, [secondsLeft, running])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(() => {
    setRunning(false)
    setSecondsLeft(TIMER_DURATIONS[stateRef.current.mode])
  }, [])
  const switchMode = useCallback((m: TimerMode) => {
    setRunning(false)
    setMode(m)
    setSecondsLeft(TIMER_DURATIONS[m])
  }, [])

  const total = TIMER_DURATIONS[mode]
  const progress = total > 0 ? (total - secondsLeft) / total : 0

  return { mode, secondsLeft, running, sessionCount, progress, start, pause, reset, switchMode }
}
