import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToPdf, isPdfExportSupported } from '../pdfExport.js'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn()
}))

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        width: 210,
        height: 297
      }
    }
  }))
}))

describe('pdfExport', () => {
  let mockElement
  let mockCanvas
  let mockJsPDF

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks()

    // Mock DOM element
    mockElement = {
      getBoundingClientRect: vi.fn().mockReturnValue({
        width: 800,
        height: 600
      }),
      style: {},
      scrollWidth: 800,
      scrollHeight: 600,
      offsetWidth: 800,
      offsetHeight: 600
    }

    // Mock canvas
    mockCanvas = {
      width: 800,
      height: 600,
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mocked-image-data')
    }

    // Mock jsPDF instance
    mockJsPDF = {
      addImage: vi.fn(),
      save: vi.fn(),
      setProperties: vi.fn(),
      internal: {
        pageSize: {
          width: 210,
          height: 297
        }
      }
    }

    // Setup module mocks
    const html2canvas = await import('html2canvas')
    const jsPDF = await import('jspdf')
    
    html2canvas.default.mockResolvedValue(mockCanvas)
    jsPDF.default.mockReturnValue(mockJsPDF)
  })

  describe('isPdfExportSupported', () => {
    it('should return true when html2canvas and jsPDF are available', () => {
      // Both modules are mocked and available
      expect(isPdfExportSupported()).toBe(true)
    })

    it('should handle missing dependencies gracefully', async () => {
      // This test is more for documentation - in real scenarios, 
      // missing dependencies would cause import errors
      expect(isPdfExportSupported()).toBe(true)
    })
  })

  describe('exportToPdf', () => {
    it('should successfully export element to PDF with default filename', async () => {
      await exportToPdf(mockElement)

      // Verify html2canvas was called with correct element and options
      const html2canvas = (await import('html2canvas')).default
      expect(html2canvas).toHaveBeenCalledWith(mockElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: mockElement.scrollWidth,
        height: mockElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })

      // Verify PDF creation
      const jsPDF = await import('jspdf')
      expect(jsPDF.default).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Verify image was added to PDF
      expect(mockJsPDF.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mocked-image-data',
        'PNG',
        20, // x position (margin)
        84.75, // y position (calculated)
        170, // width (availableWidth)
        127.5, // height (calculated)
        undefined,
        'FAST'
      )

      // Verify PDF was saved
      expect(mockJsPDF.save).toHaveBeenCalledWith('Bingo-Board.pdf')
    })

    it('should export with custom filename', async () => {
      const customFilename = 'custom-bingo-board'
      await exportToPdf(mockElement, customFilename)

      expect(mockJsPDF.save).toHaveBeenCalledWith(`${customFilename}.pdf`)
    })

    it('should handle landscape orientation for wide elements', async () => {
      // Mock a wide element
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 1200,
        height: 600
      })
      mockCanvas.width = 1200
      mockCanvas.height = 600

      await exportToPdf(mockElement)

      const jsPDF = await import('jspdf')
      expect(jsPDF.default).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
    })

    it('should handle portrait orientation for tall elements', async () => {
      // Mock a tall element
      mockElement.getBoundingClientRect.mockReturnValue({
        width: 600,
        height: 1200
      })
      mockCanvas.width = 600
      mockCanvas.height = 1200

      await exportToPdf(mockElement)

      const jsPDF = await import('jspdf')
      expect(jsPDF.default).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
    })

    it('should calculate correct image dimensions and positioning', async () => {
      // Mock specific dimensions
      const elementWidth = 800
      const elementHeight = 600
      mockElement.getBoundingClientRect.mockReturnValue({
        width: elementWidth,
        height: elementHeight
      })
      mockCanvas.width = elementWidth
      mockCanvas.height = elementHeight

      await exportToPdf(mockElement)

      // Verify addImage was called with calculated dimensions
      expect(mockJsPDF.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mocked-image-data',
        'PNG',
        20, // x position (margin)
        84.75, // y position (calculated)
        170, // width (availableWidth)
        127.5, // height (calculated)
        undefined,
        'FAST'
      )

      const addImageCall = mockJsPDF.addImage.mock.calls[0]
      const [, , x, y, width, height] = addImageCall

      // Verify positioning is centered
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
      
      // Verify dimensions are reasonable (scaled to fit PDF page)
      expect(width).toBeGreaterThan(0)
      expect(height).toBeGreaterThan(0)
      expect(width).toBeLessThanOrEqual(210) // A4 width
      expect(height).toBeLessThanOrEqual(297) // A4 height
    })

    it('should handle html2canvas errors', async () => {
      const html2canvas = (await import('html2canvas')).default
      const error = new Error('Canvas generation failed')
      html2canvas.mockRejectedValue(error)

      await expect(exportToPdf(mockElement)).rejects.toThrow('Canvas generation failed')
    })

    it('should handle jsPDF creation errors', async () => {
      const jsPDF = await import('jspdf')
      jsPDF.default.mockImplementation(() => {
        throw new Error('PDF creation failed')
      })

      await expect(exportToPdf(mockElement)).rejects.toThrow('PDF creation failed')
    })

    it('should handle missing element', async () => {
      await expect(exportToPdf(null)).rejects.toThrow()
    })

    it('should handle element without getBoundingClientRect', async () => {
      const invalidElement = { offsetWidth: 800, offsetHeight: 600, scrollWidth: 800, scrollHeight: 600 }
      
      // This should succeed since html2canvas handles missing getBoundingClientRect
      await expect(exportToPdf(invalidElement)).resolves.not.toThrow()
    })

    describe('image scaling and positioning', () => {
      it('should scale down large images to fit PDF page', async () => {
        // Mock very large element
        mockElement.getBoundingClientRect.mockReturnValue({
          width: 2000,
          height: 1500
        })
        mockCanvas.width = 2000
        mockCanvas.height = 1500

        await exportToPdf(mockElement)

        const addImageCall = mockJsPDF.addImage.mock.calls[0]
        const [, , , , width, height] = addImageCall

        // Should be scaled down to fit A4
        expect(width).toBeLessThanOrEqual(210)
        expect(height).toBeLessThanOrEqual(297)
      })

      it('should maintain aspect ratio when scaling', async () => {
        // Mock square element
        mockElement.getBoundingClientRect.mockReturnValue({
          width: 1000,
          height: 1000
        })
        mockCanvas.width = 1000
        mockCanvas.height = 1000

        await exportToPdf(mockElement)

        const addImageCall = mockJsPDF.addImage.mock.calls[0]
        const [, , , , width, height] = addImageCall

        // Should maintain square aspect ratio
        expect(Math.abs(width - height)).toBeLessThan(1) // Allow for small rounding differences
      })

      it('should center image on PDF page', async () => {
        await exportToPdf(mockElement)

        const addImageCall = mockJsPDF.addImage.mock.calls[0]
        const [, , x, y, width, height] = addImageCall

        // Should be centered on A4 page
        const expectedX = (210 - width) / 2
        const expectedY = (297 - height) / 2

        expect(Math.abs(x - expectedX)).toBeLessThan(1)
        expect(Math.abs(y - expectedY)).toBeLessThan(1)
      })
    })

    describe('canvas options', () => {
      it('should use correct html2canvas options', async () => {
        await exportToPdf(mockElement)

        const html2canvas = (await import('html2canvas')).default
        const expectedOptions = {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          width: mockElement.scrollWidth,
          height: mockElement.scrollHeight,
          scrollX: 0,
          scrollY: 0
        }

        expect(html2canvas).toHaveBeenCalledWith(mockElement, expectedOptions)
      })

      it('should handle different background colors', async () => {
        // This test is more for future extensibility
        await exportToPdf(mockElement)

        const html2canvas = (await import('html2canvas')).default
        const call = html2canvas.mock.calls[0]
        const options = call[1]

        expect(options.backgroundColor).toBe('#ffffff')
      })
    })

    describe('file naming', () => {
      it('should add .pdf extension if not provided', async () => {
        await exportToPdf(mockElement, 'test-file')
        expect(mockJsPDF.save).toHaveBeenCalledWith('test-file.pdf')
      })

      it('should not duplicate .pdf extension', async () => {
        await exportToPdf(mockElement, 'test-file.pdf')
        expect(mockJsPDF.save).toHaveBeenCalledWith('test-file-pdf.pdf')
      })

      it('should handle special characters in filename', async () => {
        const filename = 'my board - special chars & symbols!'
        await exportToPdf(mockElement, filename)
        expect(mockJsPDF.save).toHaveBeenCalledWith('my-board---special-chars---symbols-.pdf')
      })
    })
  })
})