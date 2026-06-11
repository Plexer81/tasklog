import { useEffect, useRef } from 'react'
import { useGame2048 } from '../hooks/useGame2048'
import type { Dir } from '../hooks/useGame2048'

const TILE_SIZE = 70
const GAP = 8
const PADDING = 8

const pos = (n: number) => PADDING + n * (TILE_SIZE + GAP)

const TILE_COLORS: Record<number, { bg: string; color: string }> = {
  2:    { bg: '#2e2e38', color: '#aaa' },
  4:    { bg: '#3a3a28', color: '#bbb' },
  8:    { bg: '#7a4a25', color: '#fff' },
  16:   { bg: '#944f20', color: '#fff' },
  32:   { bg: '#2a6a5a', color: '#fff' },
  64:   { bg: '#1a5a9a', color: '#fff' },
  128:  { bg: '#6a2a8a', color: '#fff' },
  256:  { bg: '#8a30aa', color: '#fff' },
  512:  { bg: '#aa6000', color: '#fff' },
  1024: { bg: '#c87800', color: '#fff' },
  2048: { bg: '#c8922a', color: '#0e0e11' },
}

function tileStyle(value: number) {
  return TILE_COLORS[value] ?? { bg: '#e8ab38', color: '#0e0e11' }
}

function fontSize(value: number) {
  if (value >= 1000) return '16px'
  if (value >= 100) return '20px'
  return '24px'
}

const KEY_MAP: Record<string, Dir> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
}

export default function Game2048() {
  const { tiles, score, best, gameOver, won, handleMove, newGame, keepGoing } = useGame2048()
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key]
      if (!dir) return
      e.preventDefault()
      handleMove(dir)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMove])

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return
    handleMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
  }

  return (
    <div className="game2048">
      <div className="game-header">
        <span className="game-title">2048</span>
        <div className="game-scores">
          <div className="game-score-box">
            <span className="game-score-label">Score</span>
            <span className="game-score-val">{score}</span>
          </div>
          <div className="game-score-box">
            <span className="game-score-label">Best</span>
            <span className="game-score-val">{best}</span>
          </div>
        </div>
        <button className="game-new-btn" onClick={newGame}>New Game</button>
      </div>

      <div className="game-board" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Static background cells */}
        <div className="game-grid-bg">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="tile-bg" />
          ))}
        </div>

        {/* Animated tiles */}
        {tiles.map(tile => {
          const { bg, color } = tileStyle(tile.value)
          return (
            <div
              key={tile.id}
              className={`tile-abs ${tile.isNew ? 'tile-new' : ''} ${tile.isMerged ? 'tile-merged' : ''}`}
              style={{
                left: pos(tile.col),
                top: pos(tile.row),
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: bg,
                color,
                fontSize: fontSize(tile.value),
              }}
            >
              {tile.value}
            </div>
          )
        })}

        {(gameOver || won) && (
          <div className="game-overlay">
            {won ? (
              <>
                <div className="overlay-icon">🏆</div>
                <div className="overlay-title">2048!</div>
                <div className="overlay-sub">You hit 2048!</div>
                <div className="overlay-actions">
                  <button onClick={keepGoing}>Keep Going</button>
                  <button onClick={newGame}>New Game</button>
                </div>
              </>
            ) : (
              <>
                <div className="overlay-icon">💀</div>
                <div className="overlay-title">Game Over</div>
                <div className="overlay-sub">No moves left.</div>
                <button onClick={newGame}>Try Again</button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="game-hint">Arrow keys or swipe to play</div>
    </div>
  )
}
