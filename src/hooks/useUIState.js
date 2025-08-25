import { useState, useCallback } from 'react'
import { MESSAGE_DISPLAY_DURATION } from '../constants/defaults'

/**
 * Custom hook for managing UI state (loading, errors, messages)
 */
export function useUIState() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null)
      setSuccessMessage('')
    }, MESSAGE_DISPLAY_DURATION)
  }, [])

  const setLoadingState = useCallback((loading, message = '') => {
    setIsLoading(loading)
    setLoadingMessage(message)
  }, [])

  const showError = useCallback((errorMessage) => {
    setError(errorMessage)
    clearMessages()
  }, [clearMessages])

  const showSuccess = useCallback((successMsg) => {
    setSuccessMessage(successMsg)
    clearMessages()
  }, [clearMessages])

  const resetUIState = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
    setError(null)
    setSuccessMessage('')
  }, [])

  return {
    // State
    isLoading,
    loadingMessage,
    error,
    successMessage,
    // Actions
    setLoadingState,
    showError,
    showSuccess,
    clearMessages,
    resetUIState
  }
}