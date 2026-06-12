import { useEffect } from 'react'
import { useState } from 'react'

type Player = 'X' | 'O'
type Cell = Player | null

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

function getWinner(board: Cell[]): Player | 'draw' | null {
  for (const [a,b,c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a] as Player
  }
  if (board.every(Boolean)) return 'draw'
  return null
}

function getWinLine(board: Cell[]): number[] | null {
  for (const line of LINES) {
    const [a,b,c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line
  }
  return null
}

function minimax(board: Cell[], depth: number, isMax: boolean): number {
  const w = getWinner(board)
  if (w === 'O') return 10 - depth
  if (w === 'X') return depth - 10
  if (w === 'draw') return 0
  if (isMax) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O'
        best = Math.max(best, minimax(board, depth + 1, false))
        board[i] = null
      }
    }
    return best
  } else {
    let best = Infinity
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X'
        best = Math.min(best, minimax(board, depth + 1, true))
        board[i] = null
      }
    }
    return best
  }
}

function bestMove(board: Cell[]): number {
  let best = -Infinity
  let move = -1
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const b = [...board]
      b[i] = 'O'
      const score = minimax(b, 0, false)
      if (score > best) { best = score; move = i }
    }
  }
  return move
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [vsAI, setVsAI] = useState(true)

  const current: Player = board.filter(Boolean).length % 2 === 0 ? 'X' : 'O'
  const winner = getWinner(board)
  const winLine = winner && winner !== 'draw' ? getWinLine(board) : null
  const gameOver = winner !== null
  const aiThinking = vsAI && !gameOver && current === 'O'

  useEffect(() => {
    if (!vsAI || gameOver || current !== 'O') return
    const id = setTimeout(() => {
      setBoard(prev => {
        const move = bestMove(prev)
        if (move === -1) return prev
        const next = [...prev]
        next[move] = 'O'
        return next
      })
    }, 320)
    return () => clearTimeout(id)
  }, [board, vsAI, gameOver, current])

  const handleClick = (i: number) => {
    if (board[i] || gameOver || aiThinking) return
    const next = [...board]
    next[i] = current
    setBoard(next)
  }

  const reset = () => setBoard(Array(9).fill(null))

  const status = winner === 'draw'
    ? "Draw!"
    : winner
    ? `${winner} wins!`
    : vsAI
    ? (current === 'X' ? 'Your turn (X)' : 'AI thinking...')
    : `${current}'s turn`

  return (
    <div className="ttt">
      <div className="game-header ttt-header">
        <span className="game-title">Tic-Tac-Toe</span>
        <button className="game-new-btn" onClick={reset}>New Game</button>
      </div>

      <div className="ttt-modes">
        <button className={`mode-btn ${vsAI ? 'active' : ''}`} onClick={() => { setVsAI(true); reset() }}>
          vs AI
        </button>
        <button className={`mode-btn ${!vsAI ? 'active' : ''}`} onClick={() => { setVsAI(false); reset() }}>
          2 Players
        </button>
      </div>

      <div className="ttt-status">{status}</div>

      <div className="ttt-grid">
        {board.map((cell, i) => (
          <button
            key={i}
            className={[
              'ttt-cell',
              cell === 'X' ? 'ttt-x' : cell === 'O' ? 'ttt-o' : '',
              winLine?.includes(i) ? 'ttt-win-cell' : '',
              !cell && !gameOver && !aiThinking ? 'ttt-clickable' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>

      {gameOver && (
        <button className="game-new-btn" onClick={reset}>Play Again</button>
      )}

      <div className="game-hint">{vsAI ? 'You are X · AI is O' : 'X goes first'}</div>
    </div>
  )
}
