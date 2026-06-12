import { useState } from 'react'
import type { Quest, Tier, SortMode } from '../types'
import { TIER_LABELS } from '../constants'
import QuestCard from './QuestCard'
import Game2048 from './Game2048'
import TicTacToe from './TicTacToe'

interface Props {
  todayQuests: Quest[]
  backlogQuests: Quest[]
  completedQuests: Quest[]
  suggestions: Quest[]
  hasAnything: boolean
  allDone: boolean
  sortMode: SortMode
  setSortMode: (m: SortMode) => void
  filter: Tier | 'all'
  setFilter: (f: Tier | 'all') => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  moveUp: (id: string, list: Quest[]) => void
  moveDown: (id: string, list: Quest[]) => void
  addQuest: (title: string, tier: Tier, dueDate?: string) => void
}

const TIERS: Tier[] = ['common', 'rare', 'epic', 'legendary']

function AddQuestForm({ onAdd }: { onAdd: (title: string, tier: Tier, dueDate?: string) => void }) {
  const [title, setTitle] = useState('')
  const [tier, setTier] = useState<Tier>('common')
  const [dueDate, setDueDate] = useState('')
  const [open, setOpen] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title, tier, dueDate || undefined)
    setTitle('')
    setTier('common')
    setDueDate('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="add-quest-btn" onClick={() => setOpen(true)}>
        + Add Task
      </button>
    )
  }

  return (
    <form className="add-quest-form" onSubmit={submit}>
      <input
        className="form-input"
        placeholder="Task name..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
        maxLength={80}
      />
      <div className="form-row">
        <select className="form-select" value={tier} onChange={e => setTier(e.target.value as Tier)}>
          {TIERS.map(t => (
            <option key={t} value={t}>{TIER_LABELS[t]}</option>
          ))}
        </select>
        <input
          type="date"
          className="form-input form-date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <button type="submit" className="form-submit">Add</button>
        <button type="button" className="form-cancel" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

export default function QuestBoard(props: Props) {
  const {
    todayQuests, backlogQuests, completedQuests, suggestions,
    hasAnything, allDone, sortMode, setSortMode, filter, setFilter,
    onComplete, onDelete, onPin, moveUp, moveDown, addQuest,
  } = props

  const [showCompleted, setShowCompleted] = useState(false)
  const [activeGame, setActiveGame] = useState<null | '2048' | 'ttt'>(null)

  const cardProps = (showPin: boolean) => ({
    sortMode,
    onComplete,
    onDelete,
    onPin: showPin ? onPin : undefined,
    onMoveUp: moveUp,
    onMoveDown: moveDown,
    showPin,
  })

  if (!hasAnything) {
    return (
      <div className="board">
        <div className="peace-state">
          <div className="peace-crest">✓</div>
          <div className="peace-title">Nothing here yet</div>
          <div className="peace-sub">Add a task to get started.</div>
          <AddQuestForm onAdd={addQuest} />
          <div className="peace-divider">— or —</div>
          <div className="game-picker">
            <button className={`game-toggle-btn ${activeGame === '2048' ? 'active' : ''}`} onClick={() => setActiveGame(g => g === '2048' ? null : '2048')}>
              {activeGame === '2048' ? 'Hide 2048' : 'Play 2048'}
            </button>
            <button className={`game-toggle-btn ${activeGame === 'ttt' ? 'active' : ''}`} onClick={() => setActiveGame(g => g === 'ttt' ? null : 'ttt')}>
              {activeGame === 'ttt' ? 'Hide Tic Tac Toe' : 'Tic Tac Toe'}
            </button>
          </div>
        </div>
        {activeGame === '2048' && <Game2048 />}
        {activeGame === 'ttt' && <TicTacToe />}
      </div>
    )
  }

  if (allDone) {
    return (
      <div className="board">
        <div className="peace-state victory">
          <div className="peace-crest">🏆</div>
          <div className="peace-title">All done!</div>
          <div className="peace-sub">Nice work. Everything's cleared.</div>
          <AddQuestForm onAdd={addQuest} />
          <button className="show-completed-link" onClick={() => setShowCompleted(v => !v)}>
            {showCompleted ? 'Hide' : 'View'} completed tasks
          </button>
          {showCompleted && (
            <div className="quest-list">
              {completedQuests.map(q => (
                <QuestCard key={q.id} quest={q} list={completedQuests} {...cardProps(false)} />
              ))}
            </div>
          )}
          <div className="peace-divider">— or —</div>
          <div className="game-picker">
            <button className={`game-toggle-btn ${activeGame === '2048' ? 'active' : ''}`} onClick={() => setActiveGame(g => g === '2048' ? null : '2048')}>
              {activeGame === '2048' ? 'Hide 2048' : 'Play 2048'}
            </button>
            <button className={`game-toggle-btn ${activeGame === 'ttt' ? 'active' : ''}`} onClick={() => setActiveGame(g => g === 'ttt' ? null : 'ttt')}>
              {activeGame === 'ttt' ? 'Hide Tic Tac Toe' : 'Tic Tac Toe'}
            </button>
          </div>
        </div>
        {activeGame === '2048' && <Game2048 />}
        {activeGame === 'ttt' && <TicTacToe />}
      </div>
    )
  }

  return (
    <div className="board">
      {/* Toolbar */}
      <div className="board-toolbar">
        <AddQuestForm onAdd={addQuest} />
        <div className="toolbar-right">
          <div className="filter-btns">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            {TIERS.map(t => (
              <button key={t} className={`filter-btn tier-filter-${t} ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                {TIER_LABELS[t]}
              </button>
            ))}
          </div>
          <button
            className={`sort-btn ${sortMode === 'manual' ? 'active' : ''}`}
            onClick={() => setSortMode(sortMode === 'auto' ? 'manual' : 'auto')}
            title="Toggle sort mode"
          >
            {sortMode === 'auto' ? '⇅ Auto' : '⇅ Manual'}
          </button>
        </div>
      </div>

      {/* Today's Raid */}
      <section className="board-section">
        <div className="section-header">
          <span className="section-label">Today</span>
          <span className="section-count">{todayQuests.length} task{todayQuests.length !== 1 ? 's' : ''}</span>
        </div>

        {todayQuests.length > 0 ? (
          <div className="quest-list">
            {todayQuests.map(q => (
              <QuestCard key={q.id} quest={q} list={todayQuests} {...cardProps(false)} />
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="suggestions">
            <div className="suggestion-label">Nothing planned today — suggested from your backlog:</div>
            {suggestions.map(q => (
              <div key={q.id} className="suggestion-item">
                <QuestCard quest={q} list={suggestions} {...cardProps(false)} onPin={onPin} showPin />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-section">No tasks for today. Pin one from the backlog or add a new task.</div>
        )}
      </section>

      {/* Backlog */}
      {backlogQuests.length > 0 && (
        <section className="board-section">
          <div className="section-header">
            <span className="section-label">Backlog</span>
            <span className="section-count">{backlogQuests.length} task{backlogQuests.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="quest-list">
            {backlogQuests.map(q => (
              <QuestCard key={q.id} quest={q} list={backlogQuests} {...cardProps(true)} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completedQuests.length > 0 && (
        <section className="board-section">
          <button className="section-header toggle-btn" onClick={() => setShowCompleted(v => !v)}>
            <span className="section-label">Completed</span>
            <span className="section-count">{completedQuests.length} {showCompleted ? '▲' : '▼'}</span>
          </button>
          {showCompleted && (
            <div className="quest-list">
              {completedQuests.map(q => (
                <QuestCard key={q.id} quest={q} list={completedQuests} {...cardProps(false)} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
