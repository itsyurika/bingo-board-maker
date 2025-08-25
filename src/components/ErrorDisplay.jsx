import { useState } from 'react'
import styles from '../styles/ErrorDisplay.module.css'

/**
 * Comprehensive error display component with detailed information
 * @param {Object} error - Error object with message, code, and details
 * @param {Function} onDismiss - Callback when error is dismissed
 * @param {string} className - Additional CSS class
 */
function ErrorDisplay({ error, onDismiss, className = '' }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!error) return null

  const isValidationError = error.name === 'ValidationError'

  const getErrorIcon = () => {
    switch (error.code) {
      case 'NO_FILE':
      case 'EMPTY_FILE':
        return '📁'
      case 'INVALID_FILE_TYPE':
        return '📄'
      case 'FILE_TOO_LARGE':
        return '📦'
      case 'INVALID_JSON':
      case 'INVALID_STRUCTURE':
        return '⚠️'
      case 'INSUFFICIENT_PROMPTS':
        return '📊'
      case 'DUPLICATE_PROMPTS':
        return '🔄'
      case 'CATEGORY_ISSUES':
      case 'PROMPT_ISSUES':
        return '🔍'
      default:
        return '❌'
    }
  }

  const renderErrorDetails = () => {
    if (!error.details || !showDetails) return null

    return (
      <div className={styles.errorDetails}>
        {error.details.suggestion && (
          <div className={styles.suggestion}>
            <strong>💡 Suggestion:</strong> {error.details.suggestion}
          </div>
        )}
        
        {error.details.issues && (
          <div className={styles.issues}>
            <strong>Issues found:</strong>
            <ul className={styles.issuesList}>
              {error.details.issues.map((issue, index) => (
                <li key={index} className={styles.issueItem}>
                  {issue.category && <span className={styles.category}>[{issue.category}]</span>}
                  {issue.index !== undefined && <span className={styles.index}>#{issue.index + 1}</span>}
                  <span className={styles.issueText}>{issue.issue}</span>
                  {issue.prompt && (
                    <code className={styles.promptSnippet}>"{issue.prompt}"</code>
                  )}
                </li>
              ))}
            </ul>
            {error.details.totalIssues > error.details.issues.length && (
              <div className={styles.moreIssues}>
                ... and {error.details.totalIssues - error.details.issues.length} more issues
              </div>
            )}
          </div>
        )}

        {error.details.duplicates && (
          <div className={styles.duplicates}>
            <strong>Duplicate prompts:</strong>
            <ul className={styles.duplicatesList}>
              {error.details.duplicates.map((duplicate, index) => (
                <li key={index} className={styles.duplicateItem}>
                  <code>"{duplicate.prompt}"</code>
                  <span className={styles.duplicateCategories}>
                    found in: {duplicate.categories.join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(error.details.fileSize || error.details.totalPrompts !== undefined) && (
          <div className={styles.stats}>
            <strong>Statistics:</strong>
            <ul className={styles.statsList}>
              {error.details.fileSize && (
                <li>File size: {(error.details.fileSize / 1024).toFixed(2)} KB</li>
              )}
              {error.details.totalPrompts !== undefined && (
                <li>Total prompts: {error.details.totalPrompts}</li>
              )}
              {error.details.minRequired && (
                <li>Required: {error.details.minRequired}</li>
              )}
              {error.details.categoriesFound && (
                <li>Categories: {error.details.categoriesFound}</li>
              )}
            </ul>
          </div>
        )}

        {error.details.originalError && (
          <div className={styles.technicalError}>
            <strong>Technical details:</strong>
            <code className={styles.errorCode}>{error.details.originalError}</code>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${styles.errorContainer} ${className}`}>
      <div className={styles.errorHeader}>
        <span className={styles.errorIcon}>{getErrorIcon()}</span>
        <div className={styles.errorContent}>
          <div className={styles.errorMessage}>
            <strong>{error.message}</strong>
          </div>
          {error.code && (
            <div className={styles.errorCode}>Error Code: {error.code}</div>
          )}
        </div>
        <div className={styles.errorActions}>
          {isValidationError && error.details && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={styles.detailsButton}
              title={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? '🔼' : '🔽'}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={styles.dismissButton}
              title="Dismiss error"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {renderErrorDetails()}
    </div>
  )
}

/**
 * Simple error display for basic error messages
 */
function SimpleErrorDisplay({ message, onDismiss, className = '' }) {
  if (!message) return null

  return (
    <div className={`${styles.simpleError} ${className}`}>
      <span className={styles.errorIcon}>❌</span>
      <span className={styles.errorMessage}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={styles.dismissButton}
          title="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export { ErrorDisplay, SimpleErrorDisplay }
export default ErrorDisplay