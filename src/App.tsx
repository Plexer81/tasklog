import { useCallback } from 'react'
import { useCharacter } from './hooks/useCharacter'
import { useTasks } from './hooks/useTasks'
import { usePomodoro } from './hooks/usePomodoro'
import Header from './components/Header'
import CharacterStats from './components/CharacterStats'
import PomodoroTimer from './components/PomodoroTimer'
import QuestBoard from './components/QuestBoard'
import './App.css'

export default function App() {
  const charHook = useCharacter()
  const tasksHook = useTasks()

  const handleSessionComplete = useCallback(() => {
    charHook.addXp(25)
    charHook.addSessionDone()
  }, [charHook])

  const pomodoroHook = usePomodoro(handleSessionComplete)

  const handleComplete = useCallback((id: string) => {
    const xp = tasksHook.completeQuest(id)
    charHook.addXp(xp)
    charHook.addQuestDone()
  }, [tasksHook, charHook])

  return (
    <div className="app">
      {charHook.levelUpFlash && (
        <div className="level-up-overlay" onClick={charHook.dismissLevelUp}>
          <div className="level-up-box">
            <div className="level-up-label">LEVEL UP</div>
            <div className="level-up-num">Level {charHook.character.level}</div>
            <div className="level-up-sub">Keep it up.</div>
            <div className="level-up-dismiss">Click to continue</div>
          </div>
        </div>
      )}

      <Header character={charHook.character} onNameChange={charHook.setName} />

      <div className="app-body">
        <aside className="sidebar">
          <CharacterStats
            character={charHook.character}
            xpInLevel={charHook.xpInLevel}
            xpNeeded={charHook.xpNeeded}
            xpPercent={charHook.xpPercent}
          />
          <PomodoroTimer {...pomodoroHook} />
        </aside>
        <main className="main">
          <QuestBoard
            todayQuests={tasksHook.todayQuests}
            backlogQuests={tasksHook.backlogQuests}
            completedQuests={tasksHook.completedQuests}
            suggestions={tasksHook.suggestions}
            hasAnything={tasksHook.hasAnything}
            allDone={tasksHook.allDone}
            sortMode={tasksHook.sortMode}
            setSortMode={tasksHook.setSortMode}
            filter={tasksHook.filter}
            setFilter={tasksHook.setFilter}
            onComplete={handleComplete}
            onDelete={tasksHook.deleteQuest}
            onPin={tasksHook.pinToday}
            moveUp={tasksHook.moveUp}
            moveDown={tasksHook.moveDown}
            addQuest={tasksHook.addQuest}
          />
        </main>
      </div>
    </div>
  )
}
