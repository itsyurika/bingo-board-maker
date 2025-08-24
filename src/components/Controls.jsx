import { useRef } from 'react'
import styles from '../styles/Controls.module.css'

/**
 * Control panel component with enhanced state management and user feedback.
 * 
 * @param {Function} onFileUpload - Callback when JSON file is uploaded
 * @param {Function} onRecreate - Callback to generate new board with same prompts
 * @param {Function} onDownloadPdf - Callback to export board as PDF
 * @param {Object} appStatus - App state information
 * @param {Object} loadingState - Loading state with message
 * @param {string} error - Current error message
 * @param {string} successMessage - Current success message
 */
function Controls({ 
  onFileUpload, 
  onRecreate, 
  onDownloadPdf, 
  appStatus = {}, 
  loadingState = { isLoading: false, message: '' },
  error = null,
  successMessage = null
}) {
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

  const { isReady, fileName, stats } = appStatus
  const { isLoading, message } = loadingState

  return (
    <div className={styles.controls}>
      {/* Status Messages */}
      {error && (
        <div className={styles.message + ' ' + styles.error}>
          ❌ {error}
        </div>
      )}
      
      {successMessage && (
        <div className={styles.message + ' ' + styles.success}>
          ✅ {successMessage}
        </div>
      )}

      {/* File Status */}
      {fileName && (
        <div className={styles.fileStatus}>
          📄 <strong>{fileName}</strong>
          {stats?.categories?.length > 0 && (
            <span className={styles.statsInfo}>
              {' '}• {stats.categories.length} categories, {stats.totalPrompts} prompts
              {stats.version > 1 && ` • v${stats.version}`}
            </span>
          )}
        </div>
      )}

      {/* Loading Status */}
      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          {message}
        </div>
      )}

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
          disabled={!isReady || isLoading}
          className={`${styles.button} ${styles.recreateButton}`}
          title={!isReady ? 'Upload a JSON file first' : 'Generate a new board with different randomization'}
        >
          {isLoading ? 'Generating...' : 'Recreate Board'}
        </button>
        
        <button
          onClick={onDownloadPdf}
          disabled={isLoading}
          className={`${styles.button} ${styles.downloadButton}`}
          title="Export current board as PDF"
        >
          {isLoading ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>
    </div>
  )
}

export default Controls