import styles from '../styles/BingoTile.module.css'

/**
 * Individual bingo tile component that displays a prompt or "Free Space".
 * 
 * @param {string} text - The prompt text to display
 * @param {boolean} isFreeSpace - Whether this tile is the center free space
 */
function BingoTile({ text, isFreeSpace = false }) {
  // Check if this tile should be a free space (either by prop or special marker)
  const isActuallyFreeSpace = isFreeSpace || text === 'FREE_SPACE'
  
  return (
    <div className={`${styles.tile} ${isActuallyFreeSpace ? styles.freeSpace : ''}`}>
      <div className={styles.content}>
        {isActuallyFreeSpace ? (
          <>
            <span className={styles.freeSpaceText}>FREE</span>
            <span className={styles.freeSpaceSubtext}>SPACE</span>
          </>
        ) : (
          <span className={styles.promptText}>{text}</span>
        )}
      </div>
      <div className={styles.nameSpace}></div>
    </div>
  )
}

export default BingoTile