import { forwardRef } from 'react'
import BingoTile from './BingoTile'
import styles from '../styles/BingoBoard.module.css'

/**
 * 5x5 bingo board grid component that renders tiles and supports PDF export.
 * 
 * @param {string[]} tiles - Array of 25 strings (24 prompts + 1 free space marker)
 * @param {React.Ref} ref - React ref for PDF screenshot capability
 */
const BingoBoard = forwardRef(({ tiles = [] }, ref) => {
  // Ensure we have exactly 25 tiles, fill with empty strings if needed
  const boardTiles = Array(25).fill('').map((_, index) => 
    tiles[index] || ''
  )

  return (
    <div ref={ref} className={styles.board}>
      {boardTiles.map((text, index) => (
        <BingoTile 
          key={index}
          text={text}
          isFreeSpace={index === 12} // Center tile (index 12) is always free space
        />
      ))}
    </div>
  )
})

BingoBoard.displayName = 'BingoBoard'

export default BingoBoard