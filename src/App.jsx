import { useState, useRef, useCallback, useMemo } from 'react'
import Controls from './components/Controls'
import BingoBoard from './components/BingoBoard'
import { generateBoardFromFile, generateBoard } from './utils/boardGenerator'
import { exportToPdf, isPdfExportSupported } from './utils/pdfExport'
import styles from './styles/App.module.css'

function App() {
  // Core state management
  const [prompts, setPrompts] = useState(null)
  const [boardTiles, setBoardTiles] = useState([])
  const [originalFileName, setOriginalFileName] = useState('')
  
  // Header customization state
  const [headerText, setHeaderText] = useState({
    title: "🌞 2025 Priceline Summer Party 🏖️",
    instructions: "You can use the same person only twice and can't use your own name! ✨",
    subtitle: "🔍 Find someone who..."
  })
  
  // UI state management  
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Statistics and metadata
  const [boardStats, setBoardStats] = useState({
    totalPrompts: 0,
    categories: [],
    generatedAt: null,
    version: 1
  })
  
  // Refs for PDF export
  const boardRef = useRef(null)
  const previewRef = useRef(null)

  /**
   * Clear all messages after a delay
   */
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError(null)
      setSuccessMessage('')
    }, 5000) // Clear after 5 seconds
  }, [])

  /**
   * Update board statistics when prompts change
   */
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

  /**
   * Reset application state
   */
  const resetAppState = useCallback(() => {
    setPrompts(null)
    setBoardTiles([])
    setOriginalFileName('')
    setError(null)
    setSuccessMessage('')
    setBoardStats({
      totalPrompts: 0,
      categories: [],
      generatedAt: null,
      version: 1
    })
  }, [])

  /**
   * Update header text values
   */
  const updateHeaderText = useCallback((field, value) => {
    setHeaderText(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  /**
   * Handle JSON file upload and generate initial board
   */
  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true)
    setLoadingMessage('Processing JSON file...')
    setError(null)
    setSuccessMessage('')
    
    try {
      console.log('Processing file:', file.name)
      
      // Validate file
      if (!file.name.toLowerCase().endsWith('.json')) {
        throw new Error('Please select a valid JSON file')
      }

      if (file.size > 1024 * 1024) { // 1MB limit
        throw new Error('File too large. Please use a file smaller than 1MB.')
      }
      
      setLoadingMessage('Parsing prompts...')
      
      // Parse file and generate board
      const tiles = await generateBoardFromFile(file)
      
      setLoadingMessage('Generating bingo board...')
      
      // Parse file again to store prompts data for regeneration
      const fileText = await file.text()
      const promptsData = JSON.parse(fileText)
      
      // Update state
      setPrompts(promptsData)
      setBoardTiles(tiles)
      setOriginalFileName(file.name)
      updateBoardStats(promptsData, 1)
      
      setSuccessMessage(`Successfully generated bingo board from ${file.name}`)
      console.log('Board generated successfully with', tiles.length, 'tiles')
      
      // Clear success message after delay
      clearMessages()
      
    } catch (err) {
      console.error('File upload error:', err)
      setError(err.message)
      clearMessages()
      
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [updateBoardStats, clearMessages])

  /**
   * Generate new board with same prompts
   */
  const handleRecreate = useCallback(() => {
    if (!prompts) {
      console.warn('No prompts available for recreation')
      setError('No prompts loaded. Please upload a JSON file first.')
      clearMessages()
      return
    }

    setIsLoading(true)
    setLoadingMessage('Generating new board...')
    setError(null)
    setSuccessMessage('')
    
    try {
      const newTiles = generateBoard(prompts)
      setBoardTiles(newTiles)
      
      // Update stats with new version
      const newVersion = boardStats.version + 1
      updateBoardStats(prompts, newVersion)
      
      setSuccessMessage(`Board recreated successfully (Version ${newVersion})`)
      console.log('Board recreated successfully')
      
      clearMessages()
      
    } catch (err) {
      console.error('Board recreation error:', err)
      setError(err.message)
      clearMessages()
      
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [prompts, boardStats.version, updateBoardStats, clearMessages])

  /**
   * Export current board as PDF
   */
  const handleDownloadPdf = useCallback(async () => {
    console.log('PDF export initiated')
    
    // Use preview ref if no actual board is generated yet (for testing)
    const elementToExport = boardRef.current || previewRef.current
    const isPreview = !boardRef.current && previewRef.current
    
    if (!elementToExport) {
      console.error('No board reference available')
      setError('Board not ready for export. Please try again.')
      clearMessages()
      return
    }

    if (!isPdfExportSupported()) {
      console.error('PDF export not supported')
      setError('PDF export is not supported in this browser. Please try a different browser.')
      clearMessages()
      return
    }

    setIsLoading(true)
    setLoadingMessage('Preparing PDF export...')
    setError(null)
    setSuccessMessage('')
    
    try {
      setLoadingMessage('Capturing board image...')
      
      // Generate filename based on current state
      const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      const baseFileName = originalFileName 
        ? originalFileName.replace('.json', '') 
        : 'Priceline-Summer-Party-Bingo'
      const versionSuffix = boardStats.version > 1 ? `-v${boardStats.version}` : ''
      const previewSuffix = isPreview ? '-preview' : ''
      const filename = `${baseFileName}${versionSuffix}${previewSuffix}-${timestamp}`
      
      setLoadingMessage('Generating PDF...')
      
      console.log('Exporting PDF with filename:', filename)
      await exportToPdf(elementToExport, filename)
      
      setSuccessMessage(`PDF exported successfully as ${filename}.pdf`)
      console.log('PDF export completed successfully')
      
      clearMessages()
      
    } catch (err) {
      console.error('PDF export error:', err)
      setError(`PDF export failed: ${err.message}`)
      clearMessages()
      
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [boardStats.version, originalFileName, clearMessages])

  // Sample tiles for preview
  const sampleTiles = [
    'has traveled to more than 5 countries',
    'speaks more than 2 languages', 
    'has run a marathon',
    'owns more than 3 pets',
    'can play a musical instrument',
    'has appeared on TV',
    'has worked here for over 5 years',
    'has given a presentation to executives',
    'leads a team of more than 10 people',
    'has been skydiving',
    'knows how to juggle',
    'has met a celebrity',
    'Free Space', // Center tile
    'can speak 3+ languages',
    'has been to all 7 continents', 
    'plays in a band',
    'has written a book',
    'can solve a Rubik\'s cube',
    'has climbed a mountain',
    'knows sign language',
    'has been on a cruise',
    'can cook without recipes',
    'has won a contest',
    'has been in a movie',
    'can do a backflip'
  ]

  // Computed values with memoization
  const boardIsReady = useMemo(() => boardTiles.length > 0, [boardTiles.length])
  
  const appStatus = useMemo(() => ({
    hasPrompts: !!prompts,
    hasBoardTiles: boardTiles.length > 0,
    isReady: boardIsReady,
    fileName: originalFileName,
    stats: boardStats
  }), [prompts, boardTiles.length, boardIsReady, originalFileName, boardStats])

  // Loading state with message
  const loadingState = useMemo(() => ({
    isLoading,
    message: loadingMessage || 'Loading...'
  }), [isLoading, loadingMessage])

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Controls 
          onFileUpload={handleFileUpload}
          onRecreate={handleRecreate}
          onDownloadPdf={handleDownloadPdf}
          appStatus={appStatus}
          loadingState={loadingState}
          error={error}
          successMessage={successMessage}
          headerText={headerText}
          onHeaderTextChange={updateHeaderText}
        />

        <div className={styles.boardSection}>
          {boardTiles.length > 0 ? (
            <BingoBoard 
              ref={boardRef} 
              tiles={boardTiles} 
              includeHeader={true}
              headerText={headerText}
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
                headerText={headerText}
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
