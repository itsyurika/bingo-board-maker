import { useState, useRef } from 'react'
import Header from './components/Header'
import Controls from './components/Controls'
import BingoBoard from './components/BingoBoard'
import { generateBoardFromFile, generateBoard } from './utils/boardGenerator'
import { exportToPdf, isPdfExportSupported } from './utils/pdfExport'
import styles from './styles/App.module.css'

function App() {
  const [prompts, setPrompts] = useState(null)
  const [boardTiles, setBoardTiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const boardRef = useRef(null)

  /**
   * Handle JSON file upload and generate initial board
   */
  const handleFileUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Processing file:', file.name)
      
      // Parse file and generate board
      const tiles = await generateBoardFromFile(file)
      
      // Parse file again to store prompts data for regeneration
      const fileText = await file.text()
      const promptsData = JSON.parse(fileText)
      
      setPrompts(promptsData)
      setBoardTiles(tiles)
      
      console.log('Board generated successfully with', tiles.length, 'tiles')
      
    } catch (err) {
      console.error('File upload error:', err)
      setError(err.message)
      
      // Show user-friendly error
      alert(`Error: ${err.message}`)
      
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Generate new board with same prompts
   */
  const handleRecreate = () => {
    if (!prompts) {
      console.warn('No prompts available for recreation')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const newTiles = generateBoard(prompts)
      setBoardTiles(newTiles)
      console.log('Board recreated successfully')
      
    } catch (err) {
      console.error('Board recreation error:', err)
      setError(err.message)
      alert(`Error recreating board: ${err.message}`)
      
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Export current board as PDF
   */
  const handleDownloadPdf = async () => {
    if (!boardRef.current) {
      console.error('Board reference not available')
      alert('Board not ready for export. Please try again.')
      return
    }

    if (!isPdfExportSupported()) {
      alert('PDF export is not supported in this browser. Please try a different browser.')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('Exporting PDF...')
      await exportToPdf(boardRef.current, 'Priceline-Summer-Party-Bingo')
      console.log('PDF export completed successfully')
      
    } catch (err) {
      console.error('PDF export error:', err)
      alert(`Error exporting PDF: ${err.message}`)
      
    } finally {
      setIsLoading(false)
    }
  }

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

  const boardIsReady = boardTiles.length > 0

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Header />
        
        <Controls 
          onFileUpload={handleFileUpload}
          onRecreate={handleRecreate}
          onDownloadPdf={handleDownloadPdf}
          boardIsReady={boardIsReady}
          isLoading={isLoading}
        />

        <div className={styles.boardSection}>
          {boardTiles.length > 0 ? (
            <BingoBoard ref={boardRef} tiles={boardTiles} />
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>Ready to Create Your Bingo Board!</h3>
              <p className={styles.emptyStateText}>
                Upload a JSON file with categorized prompts to generate your custom bingo board.
              </p>
              <br />
              <BingoBoard ref={boardRef} tiles={sampleTiles} />
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
