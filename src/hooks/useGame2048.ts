import { useState, useCallback, useRef } from 'react'

export type Dir = 'left' | 'right' | 'up' | 'down'

export interface Tile {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

const BEST_KEY = 'ql_2048_best'
let nextId = 1

interface Cell { id: number; value: number }

function makeCell(value: number): Cell {
  return { id: nextId++, value }
}

function toGrid(tiles: Tile[]): (Cell | null)[][] {
  const g: (Cell | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null))
  tiles.forEach(t => { g[t.row][t.col] = { id: t.id, value: t.value } })
  return g
}

function slideRow(row: (Cell | null)[]): { out: (Cell | null)[]; score: number } {
  const filled = row.filter((c): c is Cell => c !== null)
  let score = 0
  const out: (Cell | null)[] = []
  let i = 0
  while (i < filled.length) {
    if (i + 1 < filled.length && filled[i].value === filled[i + 1].value) {
      const val = filled[i].value * 2
      score += val
      out.push(makeCell(val))
      i += 2
    } else {
      out.push(filled[i])
      i++
    }
  }
  while (out.length < 4) out.push(null)
  return { out, score }
}

function transposeGrid(g: (Cell | null)[][]): (Cell | null)[][] {
  return g[0].map((_, c) => g.map(r => r[c]))
}

function applyMove(tiles: Tile[], dir: Dir): { tiles: Tile[]; score: number; moved: boolean } {
  const origIds = new Set(tiles.map(t => t.id))
  let grid = toGrid(tiles)
  let totalScore = 0

  const processRows = (g: (Cell | null)[][], reverse: boolean) =>
    g.map(row => {
      const input = reverse ? [...row].reverse() : row
      const { out, score } = slideRow(input)
      totalScore += score
      return reverse ? out.reverse() : out
    })

  if (dir === 'left')  grid = processRows(grid, false)
  else if (dir === 'right') grid = processRows(grid, true)
  else if (dir === 'up')   grid = transposeGrid(processRows(transposeGrid(grid), false))
  else                      grid = transposeGrid(processRows(transposeGrid(grid), true))

  const newTiles: Tile[] = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const cell = grid[r][c]
      if (cell) newTiles.push({
        id: cell.id,
        value: cell.value,
        row: r,
        col: c,
        isMerged: !origIds.has(cell.id),
        isNew: false,
      })
    }

  const before = tiles.map(t => `${t.row}${t.col}${t.value}`).sort().join()
  const after  = newTiles.map(t => `${t.row}${t.col}${t.value}`).sort().join()

  return { tiles: newTiles, score: totalScore, moved: before !== after }
}

function spawnTile(tiles: Tile[]): Tile[] {
  const taken = new Set(tiles.map(t => `${t.row},${t.col}`))
  const empty: { row: number; col: number }[] = []
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!taken.has(`${r},${c}`)) empty.push({ row: r, col: c })
  if (!empty.length) return tiles
  const { row, col } = empty[Math.floor(Math.random() * empty.length)]
  return [...tiles, { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, row, col, isNew: true }]
}

function initTiles(): Tile[] {
  return spawnTile(spawnTile([]))
}

function isGameOver(tiles: Tile[]): boolean {
  if (tiles.length < 16) return false
  const g = toGrid(tiles)
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (c + 1 < 4 && g[r][c]?.value === g[r][c + 1]?.value) return false
      if (r + 1 < 4 && g[r][c]?.value === g[r + 1][c]?.value) return false
    }
  return true
}

export function useGame2048() {
  const [tiles, setTiles] = useState<Tile[]>(initTiles)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10))
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const continuedRef = useRef(false)

  const handleMove = useCallback((dir: Dir) => {
    setTiles(prev => {
      const { tiles: moved, score: gained, moved: didMove } = applyMove(prev, dir)
      if (!didMove) return prev
      const next = spawnTile(moved)
      setScore(s => {
        const ns = s + gained
        setBest(b => { if (ns > b) { localStorage.setItem(BEST_KEY, String(ns)); return ns } return b })
        return ns
      })
      if (!continuedRef.current && next.some(t => t.value >= 2048)) setWon(true)
      if (isGameOver(next)) setGameOver(true)
      return next
    })
  }, [])

  const newGame = useCallback(() => {
    setTiles(initTiles())
    setScore(0)
    setGameOver(false)
    setWon(false)
    continuedRef.current = false
  }, [])

  const keepGoing = useCallback(() => {
    continuedRef.current = true
    setWon(false)
  }, [])

  return { tiles, score, best, gameOver, won, handleMove, newGame, keepGoing }
}
