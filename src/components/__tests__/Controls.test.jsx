import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Controls from '../Controls.jsx'

describe('Controls', () => {
  const mockProps = {
    onFileUpload: vi.fn(),
    onRecreate: vi.fn(),
    onDownloadPdf: vi.fn(),
    appStatus: {
      isReady: false,
      fileName: '',
      stats: { categories: [], totalPrompts: 0, version: 1 }
    },
    loadingState: { isLoading: false, message: '' },
    error: null,
    successMessage: null,
    headerText: {
      title: 'Test Title',
      instructions: 'Test Instructions',
      subtitle: 'Test Subtitle'
    },
    onHeaderTextChange: vi.fn(),
    includeFreeSpace: true,
    onFreeSpaceToggle: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render all main buttons', () => {
      render(<Controls {...mockProps} />)
      
      expect(screen.getByText('Upload JSON File')).toBeInTheDocument()
      expect(screen.getByText('Recreate Board')).toBeInTheDocument()
      expect(screen.getByText('Download PDF')).toBeInTheDocument()
    })

    it('should render header customization section', () => {
      render(<Controls {...mockProps} />)
      
      expect(screen.getByText('Customize Header')).toBeInTheDocument()
      expect(screen.getByLabelText('Title:')).toBeInTheDocument()
      expect(screen.getByLabelText('Instructions:')).toBeInTheDocument()
      expect(screen.getByLabelText('Subtitle:')).toBeInTheDocument()
    })

    it('should render free space toggle', () => {
      render(<Controls {...mockProps} />)
      
      expect(screen.getByText('Include Free Space tile')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })
  })

  describe('file upload', () => {
    it('should handle file selection', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      const file = new File(['{"test": ["data"]}'], 'test.json', { type: 'application/json' })
      const input = screen.getByRole('button', { name: /upload json file/i }).nextElementSibling
      
      await user.upload(input, file)
      
      expect(mockProps.onFileUpload).toHaveBeenCalledWith(file)
    })

    it('should reject non-JSON files', async () => {
      const user = userEvent.setup()
      
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      render(<Controls {...mockProps} />)
      
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByRole('button', { name: /upload json file/i }).nextElementSibling
      
      await user.upload(input, file)
      
      expect(alertSpy).toHaveBeenCalledWith('Please select a valid JSON file.')
      expect(mockProps.onFileUpload).not.toHaveBeenCalled()
      
      alertSpy.mockRestore()
    })

    it('should trigger file input when upload button is clicked', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      const uploadButton = screen.getByText('Upload JSON File')
      const fileInput = uploadButton.nextElementSibling
      
      // Mock the click method
      const clickSpy = vi.spyOn(fileInput, 'click')
      
      await user.click(uploadButton)
      
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('button states', () => {
    it('should disable recreate button when not ready', () => {
      render(<Controls {...mockProps} />)
      
      const recreateButton = screen.getByText('Recreate Board')
      expect(recreateButton).toBeDisabled()
    })

    it('should enable recreate button when ready', () => {
      const readyProps = {
        ...mockProps,
        appStatus: { ...mockProps.appStatus, isReady: true }
      }
      
      render(<Controls {...readyProps} />)
      
      const recreateButton = screen.getByText('Recreate Board')
      expect(recreateButton).not.toBeDisabled()
    })

    it('should disable all buttons when loading', () => {
      const loadingProps = {
        ...mockProps,
        loadingState: { isLoading: true, message: 'Loading...' }
      }
      
      render(<Controls {...loadingProps} />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.getByText('Generating...')).toBeInTheDocument()
      expect(screen.getByText('Exporting...')).toBeInTheDocument()
      
      const buttons = screen.getAllByRole('button').filter(btn => 
        !btn.hasAttribute('type') || btn.getAttribute('type') !== 'checkbox'
      )
      buttons.forEach(button => {
        if (!button.classList.contains('checkbox')) {
          expect(button).toBeDisabled()
        }
      })
    })
  })

  describe('button interactions', () => {
    it('should call onRecreate when recreate button is clicked', async () => {
      const user = userEvent.setup()
      const readyProps = {
        ...mockProps,
        appStatus: { ...mockProps.appStatus, isReady: true }
      }
      
      render(<Controls {...readyProps} />)
      
      await user.click(screen.getByText('Recreate Board'))
      
      expect(mockProps.onRecreate).toHaveBeenCalled()
    })

    it('should call onDownloadPdf when download button is clicked', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      await user.click(screen.getByText('Download PDF'))
      
      expect(mockProps.onDownloadPdf).toHaveBeenCalled()
    })
  })

  describe('header customization', () => {
    it('should display current header text values', () => {
      render(<Controls {...mockProps} />)
      
      expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Instructions')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Subtitle')).toBeInTheDocument()
    })

    it('should call onHeaderTextChange when title changes', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      const titleInput = screen.getByLabelText('Title:')
      
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')
      
      expect(mockProps.onHeaderTextChange).toHaveBeenCalledWith('title', 'New Title')
    })

    it('should call onHeaderTextChange when instructions change', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      const instructionsInput = screen.getByLabelText('Instructions:')
      
      await user.clear(instructionsInput)
      await user.type(instructionsInput, 'New Instructions')
      
      expect(mockProps.onHeaderTextChange).toHaveBeenCalledWith('instructions', 'New Instructions')
    })

    it('should call onHeaderTextChange when subtitle changes', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      const subtitleInput = screen.getByLabelText('Subtitle:')
      
      await user.clear(subtitleInput)
      await user.type(subtitleInput, 'New Subtitle')
      
      expect(mockProps.onHeaderTextChange).toHaveBeenCalledWith('subtitle', 'New Subtitle')
    })

    it('should not render header section when onHeaderTextChange is not provided', () => {
      const propsWithoutHeaderChange = { ...mockProps }
      delete propsWithoutHeaderChange.onHeaderTextChange
      
      render(<Controls {...propsWithoutHeaderChange} />)
      
      expect(screen.queryByText('Customize Header')).not.toBeInTheDocument()
    })
  })

  describe('free space toggle', () => {
    it('should show checkbox as checked when includeFreeSpace is true', () => {
      render(<Controls {...mockProps} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('should show checkbox as unchecked when includeFreeSpace is false', () => {
      const props = { ...mockProps, includeFreeSpace: false }
      render(<Controls {...props} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('should call onFreeSpaceToggle when checkbox is clicked', async () => {
      const user = userEvent.setup()
      render(<Controls {...mockProps} />)
      
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      
      expect(mockProps.onFreeSpaceToggle).toHaveBeenCalledWith(false)
    })

    it('should not render free space toggle when onFreeSpaceToggle is not provided', () => {
      const propsWithoutToggle = { ...mockProps }
      delete propsWithoutToggle.onFreeSpaceToggle
      
      render(<Controls {...propsWithoutToggle} />)
      
      expect(screen.queryByText('Include Free Space tile')).not.toBeInTheDocument()
    })
  })

  describe('status messages', () => {
    it('should display error message', () => {
      const props = { ...mockProps, error: 'Test error message' }
      render(<Controls {...props} />)
      
      expect(screen.getByText('❌ Test error message')).toBeInTheDocument()
    })

    it('should display success message', () => {
      const props = { ...mockProps, successMessage: 'Test success message' }
      render(<Controls {...props} />)
      
      expect(screen.getByText('✅ Test success message')).toBeInTheDocument()
    })

    it('should display loading message', () => {
      const props = {
        ...mockProps,
        loadingState: { isLoading: true, message: 'Processing file...' }
      }
      render(<Controls {...props} />)
      
      expect(screen.getByText('Processing file...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument() // loading spinner
    })
  })

  describe('file status', () => {
    it('should display file name and stats when file is loaded', () => {
      const props = {
        ...mockProps,
        appStatus: {
          fileName: 'test.json',
          stats: {
            categories: ['personal', 'work'],
            totalPrompts: 50,
            version: 1
          }
        }
      }
      
      render(<Controls {...props} />)
      
      expect(screen.getByText('test.json')).toBeInTheDocument()
      expect(screen.getByText(/2 categories, 50 prompts/)).toBeInTheDocument()
    })

    it('should display version info for recreated boards', () => {
      const props = {
        ...mockProps,
        appStatus: {
          fileName: 'test.json',
          stats: {
            categories: ['personal'],
            totalPrompts: 25,
            version: 3
          }
        }
      }
      
      render(<Controls {...props} />)
      
      expect(screen.getByText(/v3/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels', () => {
      render(<Controls {...mockProps} />)
      
      expect(screen.getByLabelText('Title:')).toBeInTheDocument()
      expect(screen.getByLabelText('Instructions:')).toBeInTheDocument()
      expect(screen.getByLabelText('Subtitle:')).toBeInTheDocument()
      expect(screen.getByLabelText(/Include Free Space tile/)).toBeInTheDocument()
    })

    it('should have button tooltips for disabled states', () => {
      render(<Controls {...mockProps} />)
      
      const recreateButton = screen.getByText('Recreate Board')
      expect(recreateButton).toHaveAttribute('title', 'Upload a JSON file first')
    })

    it('should have proper button types', () => {
      render(<Controls {...mockProps} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })

  describe('edge cases', () => {
    it('should handle missing props gracefully', () => {
      const minimalProps = {
        onFileUpload: vi.fn(),
        onRecreate: vi.fn(),
        onDownloadPdf: vi.fn()
      }
      
      expect(() => render(<Controls {...minimalProps} />)).not.toThrow()
    })

    it('should handle empty header text', () => {
      const props = {
        ...mockProps,
        headerText: { title: '', instructions: '', subtitle: '' }
      }
      
      render(<Controls {...props} />)
      
      expect(screen.getByLabelText('Title:')).toHaveValue('')
      expect(screen.getByLabelText('Instructions:')).toHaveValue('')
      expect(screen.getByLabelText('Subtitle:')).toHaveValue('')
    })

    it('should handle missing header text object', () => {
      const props = { ...mockProps, headerText: {} }
      
      render(<Controls {...props} />)
      
      expect(screen.getByLabelText('Title:')).toHaveValue('')
      expect(screen.getByLabelText('Instructions:')).toHaveValue('')
      expect(screen.getByLabelText('Subtitle:')).toHaveValue('')
    })
  })
})