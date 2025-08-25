import { useRef, useCallback, useMemo, useEffect, useState } from 'react'
import Controls from './components/Controls'
import BingoBoard from './components/BingoBoard'
import ErrorDisplay from './components/ErrorDisplay'
import { generateBoard } from './utils/boardGenerator'
import { generateSampleTiles } from './data/sampleTiles'
import { handleFileUpload } from './utils/fileHandlers'
import { handlePdfExport, generatePdfFilename } from './utils/pdfHandlers'
import { initializeBrowserSupport } from './utils/browserSupport'
import { ValidationError } from './utils/validation'
import { useBoardState } from './hooks/useBoardState'
import { useUIState } from './hooks/useUIState'
import { useHeaderState } from './hooks/useHeaderState'
import { LOADING_MESSAGES } from './constants/defaults'
import styles from './styles/App.module.css'

function App() {
  // Custom hooks for state management
  const boardState = useBoardState()
  const uiState = useUIState()
  const headerState = useHeaderState()
  
  // Board configuration
  const [includeFreeSpace, setIncludeFreeSpace] = useState(true)
  
  // Browser support and warnings
  const [browserSupport, setBrowserSupport] = useState(null)
  const [warnings, setWarnings] = useState([])
  
  // Refs for PDF export
  const boardRef = useRef(null)
  const previewRef = useRef(null)

  // Initialize browser support checking
  useEffect(() => {
    const support = initializeBrowserSupport()
    setBrowserSupport(support)
    
    if (!support.supported) {
      uiState.showError(support.error)
    }
  }, [])

  /**
   * Regenerate board when Free Space setting changes (if prompts are loaded)
   */
  useEffect(() => {
    if (boardState.prompts && boardState.boardTiles.length > 0) {
      try {
        const newTiles = generateBoard(boardState.prompts, includeFreeSpace)
        boardState.setBoardTiles(newTiles)
        boardState.updateBoardStats(boardState.prompts, boardState.boardStats.version)
        console.log('Board regenerated due to Free Space setting change')
      } catch (err) {
        console.error('Error regenerating board after Free Space change:', err)
        uiState.showError(err.message)
      }
    }
  }, [includeFreeSpace])

  /**
   * Handle JSON file upload and generate initial board
   */
  const handleFileUploadWrapper = useCallback(async (file) => {
    try {
      const { tiles, promptsData, warnings: uploadWarnings } = await handleFileUpload(
        file, 
        includeFreeSpace, 
        {
          setLoadingState: uiState.setLoadingState,
          showError: uiState.showError
        }
      )

      // Update board state
      boardState.setPrompts(promptsData)
      boardState.setBoardTiles(tiles)
      boardState.setOriginalFileName(file.name)
      boardState.updateBoardStats(promptsData, 1)

      // Set warnings from upload
      setWarnings(uploadWarnings || [])

      uiState.showSuccess(`Successfully generated bingo board from ${file.name}`)
      
    } catch (err) {
      // Clear any previous warnings on error
      setWarnings([])
      
      // Show detailed error with ErrorDisplay component
      if (err instanceof ValidationError) {
        uiState.showError(err)
      } else {
        // Convert regular errors to a more user-friendly format
        const friendlyError = new ValidationError(
          err.message || 'An unexpected error occurred',
          'UPLOAD_ERROR',
          {
            suggestion: 'Please check your file and try again. Make sure it\'s a valid JSON file with the correct format.'
          }
        )
        uiState.showError(friendlyError)
      }
    }
  }, [includeFreeSpace, boardState, uiState])

  /**
   * Generate new board with same prompts
   */
  const handleRecreate = useCallback(() => {
    if (!boardState.prompts) {
      console.warn('No prompts available for recreation')
      uiState.showError('No prompts loaded. Please upload a JSON file first.')
      return
    }

    uiState.setLoadingState(true, LOADING_MESSAGES.RECREATING_BOARD)
    
    try {
      const newTiles = generateBoard(boardState.prompts, includeFreeSpace)
      boardState.setBoardTiles(newTiles)

      // Update stats with new version
      const newVersion = boardState.boardStats.version + 1
      boardState.updateBoardStats(boardState.prompts, newVersion)

      uiState.showSuccess(`Board recreated successfully (Version ${newVersion})`)
      console.log('Board recreated successfully')
      
    } catch (err) {
      console.error('Board recreation error:', err)
      uiState.showError(err.message)
    } finally {
      uiState.setLoadingState(false)
    }
  }, [boardState, uiState, includeFreeSpace])

  /**
   * Export current board as PDF
   */
  const handleDownloadPdf = useCallback(async () => {
    // Use preview ref if no actual board is generated yet (for testing)
    const elementToExport = boardRef.current || previewRef.current
    const isPreview = !boardRef.current && previewRef.current
    
    const filename = generatePdfFilename(
      boardState.originalFileName, 
      boardState.boardStats.version, 
      isPreview
    )

    await handlePdfExport(
      elementToExport, 
      filename, 
      {
        setLoadingState: uiState.setLoadingState,
        showError: uiState.showError,
        showSuccess: uiState.showSuccess
      }
    )
  }, [boardState.originalFileName, boardState.boardStats.version, uiState])

  // Sample tiles for preview - memoized
  const sampleTiles = useMemo(() => 
    generateSampleTiles(includeFreeSpace), 
    [includeFreeSpace]
  )

  // Computed values with memoization
  const boardIsReady = useMemo(() => 
    boardState.boardTiles.length > 0, 
    [boardState.boardTiles.length]
  )
  
  const appStatus = useMemo(() => ({
    hasPrompts: !!boardState.prompts,
    hasBoardTiles: boardState.boardTiles.length > 0,
    isReady: boardIsReady,
    fileName: boardState.originalFileName,
    stats: boardState.boardStats
  }), [boardState.prompts, boardState.boardTiles.length, boardIsReady, boardState.originalFileName, boardState.boardStats])

  const loadingState = useMemo(() => ({
    isLoading: uiState.isLoading,
    message: uiState.loadingMessage || 'Loading...'
  }), [uiState.isLoading, uiState.loadingMessage])

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        {/* Enhanced Error Display */}
        {uiState.error && (
          <ErrorDisplay 
            error={uiState.error} 
            onDismiss={() => uiState.showError(null)}
          />
        )}

        {/* Warnings Display */}
        {warnings.length > 0 && (
          <div className={styles.warningsContainer}>
            {warnings.map((warning, index) => (
              <div key={index} className={styles.warning}>
                <span className={styles.warningIcon}>⚠️</span>
                <div className={styles.warningContent}>
                  <strong>{warning.message}</strong>
                  {warning.details && <div className={styles.warningDetails}>{warning.details}</div>}
                  {warning.suggestion && <div className={styles.warningSuggestion}>{warning.suggestion}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <Controls
          onFileUpload={handleFileUploadWrapper}
          onRecreate={handleRecreate}
          onDownloadPdf={handleDownloadPdf}
          appStatus={appStatus}
          loadingState={loadingState}
          error={null} // We handle errors separately now
          successMessage={uiState.successMessage}
          headerText={headerState.headerText}
          onHeaderTextChange={headerState.updateHeaderText}
          includeFreeSpace={includeFreeSpace}
          onFreeSpaceToggle={setIncludeFreeSpace}
        />

        <div className={styles.boardSection}>
          {boardState.boardTiles.length > 0 ? (
            <BingoBoard
              ref={boardRef}
              tiles={boardState.boardTiles}
              includeHeader={true}
              headerText={headerState.headerText}
            />
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Ready to Create Your Bingo Board!</h3>
              <p className={styles.emptyStateText}>
                Upload a JSON file with categorized prompts to generate your custom bingo board.
              </p>
              <br />
              <BingoBoard
                ref={previewRef}
                tiles={sampleTiles}
                includeHeader={true}
                headerText={headerState.headerText}
              />
              <p className={styles.emptyStateText}>
                <em>↑ Preview with sample data</em>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App