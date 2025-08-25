import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App.jsx'

// Mock the utility modules
vi.mock('../utils/pdfExport.js', () => ({
  exportToPdf: vi.fn().mockResolvedValue(undefined),
  isPdfExportSupported: vi.fn().mockReturnValue(true)
}))

describe('App Integration Tests', () => {
  const validPrompts = {
    personal: Array.from({ length: 10 }, (_, i) => `personal prompt ${i + 1}`),
    work: Array.from({ length: 10 }, (_, i) => `work prompt ${i + 1}`),
    hobbies: Array.from({ length: 10 }, (_, i) => `hobby prompt ${i + 1}`)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock FileReader
    global.FileReader = class MockFileReader {
      constructor() {
        this.onload = null
        this.onerror = null
        this.result = null
        this.readAsText = vi.fn()
      }
      
      readAsText(file) {
        setTimeout(() => {
          this.result = file.mockContent || JSON.stringify(validPrompts)
          if (this.onload) this.onload()
        }, 10)
      }
    }
  })

  describe('File Upload Workflow', () => {
    it('should successfully upload and process a valid JSON file', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Initially should show preview
      expect(screen.getByText('Ready to Create Your Bingo Board!')).toBeInTheDocument()
      expect(screen.getByText('↑ Preview with sample data')).toBeInTheDocument()

      // Create mock file
      const file = new File([JSON.stringify(validPrompts)], 'test.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      // Upload file
      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Processing/)).toBeInTheDocument()
      })

      // Should show success and board
      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      }, { timeout: 3000 })

      // Should show file info
      expect(screen.getByText('test.json')).toBeInTheDocument()
      expect(screen.getByText(/3 categories/)).toBeInTheDocument()

      // Should enable recreate button
      const recreateButton = screen.getByText('Recreate Board')
      expect(recreateButton).not.toBeDisabled()
    })

    it('should handle invalid JSON file gracefully', async () => {
      const user = userEvent.setup()
      render(<App />)

      const invalidFile = new File(['invalid json'], 'invalid.json', {
        type: 'application/json'
      })
      invalidFile.mockContent = 'invalid json'

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, invalidFile)

      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON file/)).toBeInTheDocument()
      })
    })

    it('should handle insufficient prompts error', async () => {
      const user = userEvent.setup()
      render(<App />)

      const insufficientPrompts = { category: ['prompt1', 'prompt2'] }
      const file = new File([JSON.stringify(insufficientPrompts)], 'insufficient.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(insufficientPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Insufficient prompts/)).toBeInTheDocument()
      })
    })

    it('should reject non-JSON files', async () => {
      const user = userEvent.setup()
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<App />)

      const textFile = new File(['some text'], 'test.txt', { type: 'text/plain' })
      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, textFile)

      expect(alertSpy).toHaveBeenCalledWith('Please select a valid JSON file.')
      alertSpy.mockRestore()
    })
  })

  describe('Board Generation and Recreation', () => {
    beforeEach(async () => {
      // Upload a file first
      const user = userEvent.setup()
      render(<App />)

      const file = new File([JSON.stringify(validPrompts)], 'test.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })
    })

    it('should recreate board with different randomization', async () => {
      const user = userEvent.setup()
      
      // Get initial board tiles
      const initialTiles = screen.getAllByRole('button')
        .map(button => button.textContent)
        .filter(text => text && text !== 'FREE SPACE')

      // Click recreate
      const recreateButton = screen.getByText('Recreate Board')
      await user.click(recreateButton)

      await waitFor(() => {
        expect(screen.getByText(/Board recreated successfully/)).toBeInTheDocument()
      })

      // Get new board tiles
      const newTiles = screen.getAllByRole('button')
        .map(button => button.textContent)
        .filter(text => text && text !== 'FREE SPACE')

      // Boards should be different (with high probability)
      expect(newTiles).not.toEqual(initialTiles)

      // Should increment version
      expect(screen.getByText(/v2/)).toBeInTheDocument()
    })

    it('should maintain same prompts after recreation', async () => {
      const user = userEvent.setup()
      
      // Get initial unique prompts
      const initialPrompts = new Set(
        screen.getAllByRole('button')
          .map(button => button.textContent)
          .filter(text => text && text !== 'FREE SPACE')
      )

      // Recreate board
      await user.click(screen.getByText('Recreate Board'))
      
      await waitFor(() => {
        expect(screen.getByText(/Board recreated successfully/)).toBeInTheDocument()
      })

      // Get new unique prompts
      const newPrompts = new Set(
        screen.getAllByRole('button')
          .map(button => button.textContent)
          .filter(text => text && text !== 'FREE SPACE')
      )

      // Should have same number of unique prompts
      expect(newPrompts.size).toBe(initialPrompts.size)
    })
  })

  describe('Free Space Toggle Integration', () => {
    it('should regenerate board when free space toggle changes', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Upload file
      const file = new File([JSON.stringify(validPrompts)], 'test.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })

      // Initially should have free space
      expect(screen.getByText('FREE SPACE')).toBeInTheDocument()
      
      const buttons = screen.getAllByRole('button')
      const boardButtons = buttons.filter(btn => 
        btn.closest('.board') && !btn.textContent.includes('Upload') && 
        !btn.textContent.includes('Recreate') && !btn.textContent.includes('Download')
      )
      expect(boardButtons).toHaveLength(25)

      // Toggle off free space
      const checkbox = screen.getByLabelText(/Include Free Space tile/)
      await user.click(checkbox)

      // Should remove free space and have 25 prompts
      await waitFor(() => {
        expect(screen.queryByText('FREE SPACE')).not.toBeInTheDocument()
      })

      const newButtons = screen.getAllByRole('button')
      const newBoardButtons = newButtons.filter(btn => 
        btn.closest('.board') && !btn.textContent.includes('Upload') && 
        !btn.textContent.includes('Recreate') && !btn.textContent.includes('Download')
      )
      expect(newBoardButtons).toHaveLength(25)
      
      // All should have content (no free space)
      const emptyButtons = newBoardButtons.filter(btn => btn.textContent === '')
      expect(emptyButtons).toHaveLength(0)
    })

    it('should update preview when free space toggle changes', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Initially should show preview with free space
      expect(screen.getByText('FREE SPACE')).toBeInTheDocument()
      expect(screen.getByText('↑ Preview with sample data')).toBeInTheDocument()

      // Toggle off free space
      const checkbox = screen.getByLabelText(/Include Free Space tile/)
      await user.click(checkbox)

      // Preview should update to remove free space
      expect(screen.queryByText('FREE SPACE')).not.toBeInTheDocument()
    })
  })

  describe('Header Customization Integration', () => {
    it('should update header text in real-time', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Get initial header elements
      expect(screen.getByText(/2025 Priceline Summer Party/)).toBeInTheDocument()

      // Change title
      const titleInput = screen.getByLabelText('Title:')
      await user.clear(titleInput)
      await user.type(titleInput, 'Custom Event Title')

      // Should update in preview immediately
      expect(screen.getByText('Custom Event Title')).toBeInTheDocument()
      expect(screen.queryByText(/2025 Priceline Summer Party/)).not.toBeInTheDocument()

      // Change instructions
      const instructionsInput = screen.getByLabelText('Instructions:')
      await user.clear(instructionsInput)
      await user.type(instructionsInput, 'New instructions here')

      expect(screen.getByText('New instructions here')).toBeInTheDocument()

      // Change subtitle
      const subtitleInput = screen.getByLabelText('Subtitle:')
      await user.clear(subtitleInput)
      await user.type(subtitleInput, 'Custom subtitle')

      expect(screen.getByText('Custom subtitle')).toBeInTheDocument()
    })

    it('should maintain custom header text after file upload', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Customize header first
      await user.clear(screen.getByLabelText('Title:'))
      await user.type(screen.getByLabelText('Title:'), 'Pre-upload Title')

      // Upload file
      const file = new File([JSON.stringify(validPrompts)], 'test.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })

      // Custom header should be maintained
      expect(screen.getByText('Pre-upload Title')).toBeInTheDocument()
    })
  })

  describe('PDF Export Integration', () => {
    it('should export preview when no board is uploaded', async () => {
      const { exportToPdf } = await import('../utils/pdfExport.js')
      const user = userEvent.setup()
      
      render(<App />)

      const downloadButton = screen.getByText('Download PDF')
      await user.click(downloadButton)

      await waitFor(() => {
        expect(exportToPdf).toHaveBeenCalled()
      })

      // Should show success message
      expect(screen.getByText(/PDF exported successfully/)).toBeInTheDocument()
    })

    it('should export actual board when uploaded', async () => {
      const { exportToPdf } = await import('../utils/pdfExport.js')
      const user = userEvent.setup()
      
      render(<App />)

      // Upload file first
      const file = new File([JSON.stringify(validPrompts)], 'board.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })

      // Export PDF
      const downloadButton = screen.getByText('Download PDF')
      await user.click(downloadButton)

      await waitFor(() => {
        expect(exportToPdf).toHaveBeenCalled()
      })

      // Should use filename based on uploaded file
      const exportCall = exportToPdf.mock.calls[0]
      expect(exportCall[1]).toContain('board')
    })
  })

  describe('Error Recovery', () => {
    it('should recover from upload error and allow new upload', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Upload invalid file
      const invalidFile = new File(['invalid'], 'invalid.json', {
        type: 'application/json'
      })
      invalidFile.mockContent = 'invalid'

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, invalidFile)

      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON file/)).toBeInTheDocument()
      })

      // Upload valid file
      const validFile = new File([JSON.stringify(validPrompts)], 'valid.json', {
        type: 'application/json'
      })
      validFile.mockContent = JSON.stringify(validPrompts)

      await user.upload(fileInput, validFile)

      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })

      // Error should be cleared
      expect(screen.queryByText(/Invalid JSON file/)).not.toBeInTheDocument()
    })

    it('should clear success messages after time', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Upload file
      const file = new File([JSON.stringify(validPrompts)], 'test.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })

      // Message should disappear after timeout
      await waitFor(() => {
        expect(screen.queryByText(/Successfully generated/)).not.toBeInTheDocument()
      }, { timeout: 6000 })
    }, 10000)
  })

  describe('Application State Management', () => {
    it('should maintain consistent state across operations', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Upload file
      const file = new File([JSON.stringify(validPrompts)], 'state-test.json', {
        type: 'application/json'
      })
      file.mockContent = JSON.stringify(validPrompts)

      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.parentNode.querySelector('input[type="file"]')
      
      await user.upload(fileInput, file)
      
      await waitFor(() => {
        expect(screen.getByText(/Successfully generated/)).toBeInTheDocument()
      })

      // Customize header
      await user.clear(screen.getByLabelText('Title:'))
      await user.type(screen.getByLabelText('Title:'), 'State Test')

      // Toggle free space
      await user.click(screen.getByLabelText(/Include Free Space tile/))

      // Recreate board
      await user.click(screen.getByText('Recreate Board'))

      await waitFor(() => {
        expect(screen.getByText(/Board recreated successfully/)).toBeInTheDocument()
      })

      // All state should be maintained
      expect(screen.getByText('State Test')).toBeInTheDocument() // Custom title
      expect(screen.getByText('state-test.json')).toBeInTheDocument() // File name
      expect(screen.queryByText('FREE SPACE')).not.toBeInTheDocument() // Free space off
      expect(screen.getByText(/v2/)).toBeInTheDocument() // Version incremented
    })
  })
})