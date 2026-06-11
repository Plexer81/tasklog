import type { Quest, SortMode } from '../types'
import { TIER_LABELS, TIER_XP } from '../constants'

interface Props {
  quest: Quest
  list: Quest[]
  sortMode: SortMode
  showPin?: boolean
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onPin?: (id: string) => void
  onMoveUp: (id: string, list: Quest[]) => void
  onMoveDown: (id: string, list: Quest[]) => void
}

function dueBadge(dueDate?: string) {
  if (!dueDate) return null
  const today = new Date().toISOString().split('T')[0]
  if (dueDate < today) return <span className="due-badge overdue">Overdue</span>
  if (dueDate === today) return <span className="due-badge today">Today</span>
  return <span className="due-badge future">{dueDate}</span>
}

export default function QuestCard({ quest, list, sortMode, showPin, onComplete, onDelete, onPin, onMoveUp, onMoveDown }: Props) {
  const idx = list.findIndex(q => q.id === quest.id)

  return (
    <div className={`quest-card tier-${quest.tier} ${quest.completed ? 'completed' : ''}`}>
      <div className="quest-left">
        <span className={`tier-badge tier-${quest.tier}`}>{TIER_LABELS[quest.tier]}</span>
        <span className="quest-title">{quest.title}</span>
        {dueBadge(quest.dueDate)}
      </div>
      <div className="quest-right">
        <span className="quest-xp">+{TIER_XP[quest.tier]} XP</span>
        {!quest.completed && (
          <>
            {showPin && onPin && (
              <button
                className={`icon-btn ${quest.pinnedToday ? 'pinned' : ''}`}
                onClick={() => onPin(quest.id)}
                title={quest.pinnedToday ? 'Unpin from today' : 'Pin to today'}
              >
                {quest.pinnedToday ? '📌' : '📍'}
              </button>
            )}
            {sortMode === 'manual' && (
              <>
                <button className="icon-btn" onClick={() => onMoveUp(quest.id, list)} disabled={idx === 0} title="Move up">↑</button>
                <button className="icon-btn" onClick={() => onMoveDown(quest.id, list)} disabled={idx === list.length - 1} title="Move down">↓</button>
              </>
            )}
            <button className="icon-btn complete-btn" onClick={() => onComplete(quest.id)} title="Complete quest">✓</button>
          </>
        )}
        <button className="icon-btn delete-btn" onClick={() => onDelete(quest.id)} title="Delete quest">✕</button>
      </div>
    </div>
  )
}
