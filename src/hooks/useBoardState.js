import { useState, useCallback } from 'react'
import { INITIAL_BOARD_STATS } from '../constants/defaults'

/**
 * Custom hook for managing board-related state
 */
export function useBoardState() {
  const [prompts, setPrompts] = useState(null)
  const [boardTiles, setBoardTiles] = useState([])
  const [originalFileName, setOriginalFileName] = useState('')
  const [boardStats, setBoardStats] = useState(INITIAL_BOARD_STATS)

  const updateBoardStats = useCallback((promptsData, version = 1) => {
    const categories = Object.keys(promptsData)
    const totalPrompts = categories.reduce((sum, cat) => sum + promptsData[cat].length, 0)

    setBoardStats({
      totalPrompts,
      categories,
      generatedAt: new Date().toISOString(),
      version
    })
  }, [])

  const resetBoardState = useCallback(() => {
    setPrompts(null)
    setBoardTiles([])
    setOriginalFileName('')
    setBoardStats(INITIAL_BOARD_STATS)
  }, [])

  return {
    // State
    prompts,
    boardTiles,
    originalFileName,
    boardStats,
    // Actions
    setPrompts,
    setBoardTiles,
    setOriginalFileName,
    updateBoardStats,
    resetBoardState
  }
}