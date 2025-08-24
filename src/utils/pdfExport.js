/**
 * PDF Export Utility
 * Handles converting bingo boards to downloadable PDF files
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Export bingo board to PDF
 * @param {HTMLElement} boardElement - DOM element to screenshot
 * @param {string} filename - PDF filename (without extension)
 * @returns {Promise<void>} Promise that resolves when PDF is generated and downloaded
 * @throws {Error} If PDF generation fails
 * 
 * @example
 * const boardRef = useRef(null)
 * await exportToPdf(boardRef.current, 'Priceline-Summer-Party-Bingo')
 */
export async function exportToPdf(boardElement, filename = 'Bingo-Board') {
  console.log('exportToPdf called with:', { boardElement, filename })
  
  if (!boardElement) {
    console.error('Board element is null or undefined')
    throw new Error('Board element is required for PDF export')
  }

  console.log('Board element details:', {
    tagName: boardElement.tagName,
    className: boardElement.className,
    offsetWidth: boardElement.offsetWidth,
    offsetHeight: boardElement.offsetHeight,
    clientWidth: boardElement.clientWidth,
    clientHeight: boardElement.clientHeight
  })

  try {
    console.log('Starting html2canvas capture...')
    
    // Configure html2canvas for high quality screenshot
    const canvas = await html2canvas(boardElement, {
      scale: 2, // Higher resolution for better PDF quality
      useCORS: true, // Handle cross-origin images if any
      allowTaint: false,
      backgroundColor: '#ffffff', // Ensure white background
      width: boardElement.offsetWidth,
      height: boardElement.offsetHeight,
      scrollX: 0,
      scrollY: 0
    })
    
    console.log('html2canvas completed. Canvas dimensions:', {
      width: canvas.width,
      height: canvas.height
    })

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png')

    // Calculate dimensions for A4 page (portrait)
    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const margin = 20 // 20mm margin on all sides

    const availableWidth = pageWidth - (margin * 2)
    const availableHeight = pageHeight - (margin * 2)

    // Calculate image dimensions maintaining aspect ratio
    const imgAspectRatio = canvas.width / canvas.height
    let imgWidth = availableWidth
    let imgHeight = availableWidth / imgAspectRatio

    // If image is too tall for page, scale by height instead
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight
      imgWidth = availableHeight * imgAspectRatio
    }

    // Center the image on the page
    const xPosition = margin + (availableWidth - imgWidth) / 2
    const yPosition = margin + (availableHeight - imgHeight) / 2

    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Add the image to PDF
    pdf.addImage(
      imgData,
      'PNG',
      xPosition,
      yPosition,
      imgWidth,
      imgHeight,
      undefined,
      'FAST' // Use FAST compression for smaller file size
    )

    // Add metadata
    pdf.setProperties({
      title: 'Bingo Board - 2025 Priceline Summer Party',
      subject: 'Interactive Bingo Game',
      author: 'Bingo Board Maker',
      creator: 'Bingo Board Maker App',
      producer: 'jsPDF'
    })

    // Trigger download
    const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, '-')
    pdf.save(`${safeName}.pdf`)

  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error(`Failed to export PDF: ${error.message}`)
  }
}

/**
 * Check if PDF export is supported in current browser
 * @returns {boolean} Whether PDF export functionality is available
 */
export function isPdfExportSupported() {
  try {
    // Check for required features
    const hasCanvas = !!window.HTMLCanvasElement
    const hasBlob = !!window.Blob
    const hasURL = !!window.URL && !!window.URL.createObjectURL
    const hasDownload = 'download' in document.createElement('a')

    return hasCanvas && hasBlob && hasURL && hasDownload
  } catch (error) {
    return false
  }
}

/**
 * Prepare board element for optimal PDF rendering
 * @param {HTMLElement} boardElement - The board element to optimize
 * @returns {Function} Cleanup function to restore original state
 */
export function optimizeForPdf(boardElement) {
  if (!boardElement) return () => {}

  const originalStyles = {
    position: boardElement.style.position,
    left: boardElement.style.left,
    top: boardElement.style.top,
    transform: boardElement.style.transform
  }

  // Temporarily position element for clean capture
  boardElement.style.position = 'relative'
  boardElement.style.left = '0'
  boardElement.style.top = '0'
  boardElement.style.transform = 'none'

  // Return cleanup function
  return () => {
    Object.entries(originalStyles).forEach(([key, value]) => {
      boardElement.style[key] = value || ''
    })
  }
}

/**
 * Export board with progress callback
 * @param {HTMLElement} boardElement - DOM element to screenshot
 * @param {string} filename - PDF filename
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<void>}
 */
export async function exportToPdfWithProgress(boardElement, filename, onProgress = () => {}) {
  try {
    onProgress(0.1) // Starting

    const cleanup = optimizeForPdf(boardElement)
    
    onProgress(0.3) // Prepared for capture
    
    const canvas = await html2canvas(boardElement, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    })
    
    onProgress(0.6) // Canvas captured
    
    const imgData = canvas.toDataURL('image/png')
    
    onProgress(0.8) // Image data ready
    
    // Same PDF generation logic as above...
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const availableWidth = pageWidth - (margin * 2)
    const availableHeight = pageHeight - (margin * 2)
    
    const imgAspectRatio = canvas.width / canvas.height
    let imgWidth = availableWidth
    let imgHeight = availableWidth / imgAspectRatio
    
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight
      imgWidth = availableHeight * imgAspectRatio
    }
    
    const xPosition = margin + (availableWidth - imgWidth) / 2
    const yPosition = margin + (availableHeight - imgHeight) / 2
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight, undefined, 'FAST')
    
    pdf.setProperties({
      title: 'Bingo Board - 2025 Priceline Summer Party',
      subject: 'Interactive Bingo Game',
      author: 'Bingo Board Maker'
    })
    
    onProgress(0.95) // PDF ready
    
    const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, '-')
    pdf.save(`${safeName}.pdf`)
    
    cleanup() // Restore original styles
    onProgress(1.0) // Complete
    
  } catch (error) {
    console.error('PDF export with progress failed:', error)
    throw new Error(`Failed to export PDF: ${error.message}`)
  }
}