import { useState, useCallback } from 'react'
import { DEFAULT_HEADER_TEXT } from '../constants/defaults'

/**
 * Custom hook for managing header text state
 */
export function useHeaderState() {
  const [headerText, setHeaderText] = useState(DEFAULT_HEADER_TEXT)

  const updateHeaderText = useCallback((field, value) => {
    setHeaderText(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const resetHeaderText = useCallback(() => {
    setHeaderText(DEFAULT_HEADER_TEXT)
  }, [])

  return {
    headerText,
    updateHeaderText,
    resetHeaderText
  }
}