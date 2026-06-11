import type { TimerMode } from '../types'

interface Props {
  mode: TimerMode
  secondsLeft: number
  running: boolean
  sessionCount: number
  progress: number
  start: () => void
  pause: () => void
  reset: () => void
  switchMode: (m: TimerMode) => void
}

const RADIUS = 42
const CIRC = 2 * Math.PI * RADIUS

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

export default function PomodoroTimer({ mode, secondsLeft, running, sessionCount, progress, start, pause, reset, switchMode }: Props) {
  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const secs = (secondsLeft % 60).toString().padStart(2, '0')
  const offset = CIRC * (1 - progress)

  return (
    <div className="panel">
      <div className="panel-title">Focus Timer</div>

      <div className="timer-modes">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
          <button
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="timer-ring-wrap">
        <svg viewBox="0 0 100 100" className="timer-ring">
          <circle cx="50" cy="50" r={RADIUS} className="ring-track" />
          <circle
            cx="50" cy="50" r={RADIUS}
            className={`ring-progress ${mode === 'focus' ? 'ring-focus' : 'ring-break'}`}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="timer-display">
          <span className="timer-time">{mins}:{secs}</span>
          <span className="timer-mode-label">{MODE_LABELS[mode]}</span>
        </div>
      </div>

      <div className="timer-controls">
        {running
          ? <button className="ctrl-btn ctrl-primary" onClick={pause}>Pause</button>
          : <button className="ctrl-btn ctrl-primary" onClick={start}>Start</button>
        }
        <button className="ctrl-btn ctrl-ghost" onClick={reset}>Reset</button>
      </div>

      <div className="session-count">
        Session {sessionCount + 1} · {4 - (sessionCount % 4)} until long break
      </div>
    </div>
  )
}
