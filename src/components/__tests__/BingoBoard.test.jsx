import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import BingoBoard from '../BingoBoard.jsx'

describe('BingoBoard', () => {
  const sampleTiles = [
    'prompt 1', 'prompt 2', 'prompt 3', 'prompt 4', 'prompt 5',
    'prompt 6', 'prompt 7', 'prompt 8', 'prompt 9', 'prompt 10',
    'prompt 11', 'prompt 12', 'FREE_SPACE', 'prompt 14', 'prompt 15',
    'prompt 16', 'prompt 17', 'prompt 18', 'prompt 19', 'prompt 20',
    'prompt 21', 'prompt 22', 'prompt 23', 'prompt 24', 'prompt 25'
  ]

  const headerText = {
    title: 'Test Event',
    instructions: 'Test instructions',
    subtitle: 'Test subtitle'
  }

  it('should render 25 tiles', () => {
    render(<BingoBoard tiles={sampleTiles} />)
    
    const tiles = document.querySelectorAll('.tile')
    expect(tiles).toHaveLength(25)
  })

  it('should render tiles with correct content', () => {
    render(<BingoBoard tiles={sampleTiles} />)
    
    expect(screen.getByText('prompt 1')).toBeInTheDocument()
    expect(screen.getByText('prompt 25')).toBeInTheDocument()
    expect(screen.getByText('FREE')).toBeInTheDocument()
    expect(screen.getByText('SPACE')).toBeInTheDocument()
  })

  it('should identify free space tile correctly', () => {
    render(<BingoBoard tiles={sampleTiles} />)
    
    const freeSpaceTiles = document.querySelectorAll('.freeSpace')
    expect(freeSpaceTiles).toHaveLength(1)
  })

  it('should render header when includeHeader is true', () => {
    render(<BingoBoard tiles={sampleTiles} includeHeader={true} headerText={headerText} />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByText(headerText.title)).toBeInTheDocument()
    expect(screen.getByText(headerText.instructions)).toBeInTheDocument()
    expect(screen.getByText(headerText.subtitle)).toBeInTheDocument()
  })

  it('should not render header when includeHeader is false', () => {
    render(<BingoBoard tiles={sampleTiles} includeHeader={false} headerText={headerText} />)
    
    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByText(headerText.title)).not.toBeInTheDocument()
  })

  it('should render header by default', () => {
    render(<BingoBoard tiles={sampleTiles} headerText={headerText} />)
    
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should handle empty tiles array', () => {
    render(<BingoBoard tiles={[]} />)
    
    const tiles = document.querySelectorAll('.tile')
    expect(tiles).toHaveLength(25)
    
    // All tiles should be empty
    tiles.forEach(tile => {
      expect(tile).toHaveTextContent('')
    })
  })

  it('should handle insufficient tiles (less than 25)', () => {
    const shortTiles = ['tile 1', 'tile 2', 'tile 3']
    render(<BingoBoard tiles={shortTiles} />)
    
    const tiles = document.querySelectorAll('.tile')
    expect(tiles).toHaveLength(25)
    
    expect(screen.getByText('tile 1')).toBeInTheDocument()
    expect(screen.getByText('tile 2')).toBeInTheDocument()
    expect(screen.getByText('tile 3')).toBeInTheDocument()
  })

  it('should handle excess tiles (more than 25)', () => {
    const excessTiles = Array.from({ length: 30 }, (_, i) => `tile ${i + 1}`)
    render(<BingoBoard tiles={excessTiles} />)
    
    const tiles = document.querySelectorAll('.tile')
    expect(tiles).toHaveLength(25)
    
    // Should only show first 25 tiles
    expect(screen.getByText('tile 1')).toBeInTheDocument()
    expect(screen.getByText('tile 25')).toBeInTheDocument()
    expect(screen.queryByText('tile 26')).not.toBeInTheDocument()
  })

  it('should forward ref correctly', () => {
    const ref = createRef()
    render(<BingoBoard ref={ref} tiles={sampleTiles} />)
    
    expect(ref.current).toBeTruthy()
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('should have correct CSS structure', () => {
    render(<BingoBoard tiles={sampleTiles} />)
    
    const container = document.querySelector('.boardContainer')
    expect(container).toBeInTheDocument()
    
    const board = container.querySelector('.board')
    expect(board).toBeInTheDocument()
  })

  describe('free space detection', () => {
    it('should identify FREE_SPACE text as free space', () => {
      const tilesWithFreeSpace = [...sampleTiles]
      tilesWithFreeSpace[10] = 'FREE_SPACE'
      
      render(<BingoBoard tiles={tilesWithFreeSpace} />)
      
      const freeSpaceTiles = document.querySelectorAll('.freeSpace')
      expect(freeSpaceTiles).toHaveLength(2) // One at index 10 and one at index 12
    })

    it('should not identify regular text as free space', () => {
      const regularTiles = Array.from({ length: 25 }, (_, i) => `regular prompt ${i + 1}`)
      render(<BingoBoard tiles={regularTiles} />)
      
      const freeSpaceTiles = document.querySelectorAll('.freeSpace')
      expect(freeSpaceTiles).toHaveLength(0)
    })

    it('should handle multiple FREE_SPACE tiles', () => {
      const multiFreeTiles = Array.from({ length: 25 }, () => 'FREE_SPACE')
      render(<BingoBoard tiles={multiFreeTiles} />)
      
      const freeTexts = screen.getAllByText('FREE')
      expect(freeTexts).toHaveLength(25)
      
      const freeSpaceTiles = document.querySelectorAll('.freeSpace')
      expect(freeSpaceTiles).toHaveLength(25)
    })
  })

  describe('accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<BingoBoard tiles={sampleTiles} includeHeader={true} headerText={headerText} />)
      
      const container = document.querySelector('.boardContainer')
      const header = screen.getByRole('banner')
      
      expect(container).toContainElement(header)
    })

    it('should maintain tile order for screen readers', () => {
      render(<BingoBoard tiles={sampleTiles} />)
      
      const tiles = document.querySelectorAll('.tile')
      
      // Check first few tiles are in correct order
      expect(tiles[0]).toHaveTextContent('prompt 1')
      expect(tiles[1]).toHaveTextContent('prompt 2')
      expect(tiles[12]).toHaveTextContent('FREESPACE')
      expect(tiles[24]).toHaveTextContent('prompt 25')
    })
  })

  describe('header integration', () => {
    it('should pass header text props correctly', () => {
      const customHeader = {
        title: 'Custom Title',
        instructions: 'Custom Instructions',
        subtitle: 'Custom Subtitle'
      }
      
      render(<BingoBoard tiles={sampleTiles} headerText={customHeader} />)
      
      expect(screen.getByText(customHeader.title)).toBeInTheDocument()
      expect(screen.getByText(customHeader.instructions)).toBeInTheDocument()
      expect(screen.getByText(customHeader.subtitle)).toBeInTheDocument()
    })

    it('should handle missing header text props', () => {
      render(<BingoBoard tiles={sampleTiles} includeHeader={true} />)
      
      // Should render header with default values
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle null tiles', () => {
      render(<BingoBoard tiles={null} />)
      
      const tiles = document.querySelectorAll('.tile')
      expect(tiles).toHaveLength(25)
    })

    it('should handle undefined tiles', () => {
      render(<BingoBoard />)
      
      const tiles = document.querySelectorAll('.tile')
      expect(tiles).toHaveLength(25)
    })

    it('should handle tiles with null values', () => {
      const tilesWithNull = ['prompt 1', null, 'prompt 3', undefined, 'prompt 5', ...Array(20).fill('filler')]
      render(<BingoBoard tiles={tilesWithNull} />)
      
      expect(screen.getByText('prompt 1')).toBeInTheDocument()
      expect(screen.getByText('prompt 3')).toBeInTheDocument()
      expect(screen.getByText('prompt 5')).toBeInTheDocument()
    })
  })

  describe('tile rendering', () => {
    it('should render tiles in correct 5x5 grid structure', () => {
      render(<BingoBoard tiles={sampleTiles} />)
      
      const board = document.querySelector('.board')
      const tiles = board.querySelectorAll('.tile')
      
      expect(tiles).toHaveLength(25)
      expect(board).toContainElement(tiles[0])
      expect(board).toContainElement(tiles[24])
    })

    it('should maintain tile content integrity', () => {
      const testTiles = Array.from({ length: 25 }, (_, i) => `Test Prompt ${i + 1}`)
      render(<BingoBoard tiles={testTiles} />)
      
      testTiles.forEach((prompt, index) => {
        if (index < 25) {
          expect(screen.getByText(prompt)).toBeInTheDocument()
        }
      })
    })
  })
})