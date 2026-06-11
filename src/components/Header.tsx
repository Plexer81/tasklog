import { useState } from 'react'
import type { Character } from '../types'

interface Props {
  character: Character
  onNameChange: (name: string) => void
}

export default function Header({ character, onNameChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(character.name)
    setEditing(true)
  }

  const commit = () => {
    if (draft.trim()) onNameChange(draft.trim())
    setEditing(false)
  }

  return (
    <header className="header">
      <div className="header-logo">TASKLOG</div>
      <div className="header-character">
        {editing ? (
          <input
            className="name-input"
            value={draft}
            autoFocus
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            maxLength={24}
          />
        ) : (
          <button className="name-btn" onClick={startEdit} title="Click to rename">
            {character.name}
          </button>
        )}
        <span className="level-badge">Lv. {character.level}</span>
      </div>
    </header>
  )
}
