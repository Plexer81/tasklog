import type { Character } from '../types'

interface Props {
  character: Character
  xpInLevel: number
  xpNeeded: number
  xpPercent: number
}

export default function CharacterStats({ character, xpInLevel, xpNeeded, xpPercent }: Props) {
  return (
    <div className="panel">
      <div className="panel-title">Stats</div>

      <div className="xp-bar-wrap">
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="xp-label">
          <span>{xpInLevel} / {xpNeeded} XP</span>
          <span>Level {character.level}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <span className="stat-val">{character.questsDone}</span>
          <span className="stat-key">Tasks</span>
        </div>
        <div className="stat">
          <span className="stat-val">{character.sessionsDone}</span>
          <span className="stat-key">Sessions</span>
        </div>
        <div className="stat">
          <span className="stat-val">{character.streak}d</span>
          <span className="stat-key">Streak</span>
        </div>
        <div className="stat">
          <span className="stat-val">+{character.xpToday}</span>
          <span className="stat-key">XP Today</span>
        </div>
      </div>
    </div>
  )
}
