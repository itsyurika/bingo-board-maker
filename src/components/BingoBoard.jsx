import { forwardRef } from 'react'
import BingoTile from './BingoTile'
import Header from './Header'
import styles from '../styles/BingoBoard.module.css'

/**
 * 5x5 bingo board grid component with integrated header that renders tiles and supports PDF export.
 * 
 * @param {string[]} tiles - Array of 25 strings (24 prompts + 1 free space marker)
 * @param {boolean} includeHeader - Whether to include the header in the board (default: true)
 * @param {Object} headerText - Header text configuration object
 * @param {React.Ref} ref - React ref for PDF screenshot capability
 */
const BingoBoard = forwardRef(({ tiles = [], includeHeader = true, headerText }, ref) => {
  // Ensure we have exactly 25 tiles, fill with empty strings if needed
  const boardTiles = Array(25).fill('').map((_, index) => 
    tiles[index] || ''
  )

  return (
    <div ref={ref} className={styles.boardContainer}>
      {includeHeader && (
        <div className={styles.headerSection}>
          <Header {...headerText} />
        </div>
      )}
      
      <div className={styles.board}>
        {boardTiles.map((text, index) => (
          <BingoTile 
            key={index}
            text={text}
            isFreeSpace={index === 12} // Center tile (index 12) is always free space
          />
        ))}
      </div>
    </div>
  )
})

BingoBoard.displayName = 'BingoBoard'

export default BingoBoard