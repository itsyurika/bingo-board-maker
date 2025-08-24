import { useRef } from 'react'
import styles from '../styles/Controls.module.css'

/**
 * Control panel component with file upload, recreate, and PDF download functionality.
 * 
 * @param {Function} onFileUpload - Callback when JSON file is uploaded
 * @param {Function} onRecreate - Callback to generate new board with same prompts
 * @param {Function} onDownloadPdf - Callback to export board as PDF
 * @param {boolean} boardIsReady - Whether a board has been generated (enables buttons)
 * @param {boolean} isLoading - Whether an operation is in progress
 */
function Controls({ onFileUpload, onRecreate, onDownloadPdf, boardIsReady = false, isLoading = false }) {
  const fileInputRef = useRef(null)

  /**
   * Handle file selection from input
   */
  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/json') {
      onFileUpload(file)
    } else {
      alert('Please select a valid JSON file.')
    }
  }

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.controls}>
      <div className={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        <button 
          onClick={handleUploadClick}
          disabled={isLoading}
          className={`${styles.button} ${styles.uploadButton}`}
        >
          {isLoading ? 'Processing...' : 'Upload JSON File'}
        </button>
      </div>

      <div className={styles.actionSection}>
        <button
          onClick={onRecreate}
          disabled={!boardIsReady || isLoading}
          className={`${styles.button} ${styles.recreateButton}`}
        >
          {isLoading ? 'Loading...' : 'Recreate Board'}
        </button>
        
        <button
          onClick={onDownloadPdf}
          disabled={!boardIsReady || isLoading}
          className={`${styles.button} ${styles.downloadButton}`}
        >
          {isLoading ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}

export default Controls