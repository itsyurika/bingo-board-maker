import { exportToPdf, isPdfExportSupported } from './pdfExport'
import { LOADING_MESSAGES } from '../constants/defaults'

/**
 * Handle PDF export with proper error handling
 * @param {HTMLElement} elementToExport - Element to export
 * @param {string} filename - Base filename
 * @param {Object} handlers - UI state handlers
 */
export async function handlePdfExport(elementToExport, filename, { setLoadingState, showError, showSuccess }) {
  console.log('PDF export initiated')

  if (!elementToExport) {
    console.error('No board reference available')
    showError('Board not ready for export. Please try again.')
    return
  }

  if (!isPdfExportSupported()) {
    console.error('PDF export not supported')
    showError('PDF export is not supported in this browser. Please try a different browser.')
    return
  }

  setLoadingState(true, LOADING_MESSAGES.PREPARING_PDF)

  try {
    setLoadingState(true, LOADING_MESSAGES.CAPTURING_IMAGE)
    
    console.log('Exporting PDF with filename:', filename)
    await exportToPdf(elementToExport, filename)
    
    showSuccess(`PDF exported successfully as ${filename}.pdf`)
    console.log('PDF export completed successfully')
    
  } catch (err) {
    console.error('PDF export error:', err)
    showError(`PDF export failed: ${err.message}`)
  } finally {
    setLoadingState(false)
  }
}

/**
 * Generate PDF filename based on current state
 * @param {string} originalFileName - Original uploaded file name
 * @param {number} version - Board version
 * @param {boolean} isPreview - Whether this is a preview export
 * @returns {string} Generated filename
 */
export function generatePdfFilename(originalFileName, version, isPreview = false) {
  const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const baseFileName = originalFileName 
    ? originalFileName.replace('.json', '') 
    : 'Priceline-Summer-Party-Bingo'
  const versionSuffix = version > 1 ? `-v${version}` : ''
  const previewSuffix = isPreview ? '-preview' : ''
  
  return `${baseFileName}${versionSuffix}${previewSuffix}-${timestamp}`
}