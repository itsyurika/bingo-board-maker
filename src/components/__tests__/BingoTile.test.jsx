import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BingoTile from '../BingoTile.jsx'

describe('BingoTile', () => {
  it('should render regular tile with text', () => {
    const text = 'has traveled abroad'
    render(<BingoTile text={text} />)
    
    expect(screen.getByText(text)).toBeInTheDocument()
    const tile = document.querySelector('.tile')
    expect(tile).toBeInTheDocument()
  })

  it('should render free space tile', () => {
    render(<BingoTile text="FREE_SPACE" isFreeSpace={true} />)
    
    expect(screen.getByText('FREE')).toBeInTheDocument()
    expect(screen.getByText('SPACE')).toBeInTheDocument()
    const tile = document.querySelector('.tile')
    expect(tile).toBeInTheDocument()
  })

  it('should apply correct CSS classes for regular tile', () => {
    render(<BingoTile text="test text" />)
    
    const tile = document.querySelector('.tile')
    expect(tile).toHaveClass('tile')
    expect(tile).not.toHaveClass('freeSpace')
  })

  it('should apply correct CSS classes for free space tile', () => {
    render(<BingoTile text="FREE_SPACE" isFreeSpace={true} />)
    
    const tile = document.querySelector('.tile')
    expect(tile).toHaveClass('tile')
    expect(tile).toHaveClass('freeSpace')
  })

  it('should handle empty text', () => {
    render(<BingoTile text="" />)
    
    const tile = document.querySelector('.tile')
    expect(tile).toBeInTheDocument()
    expect(tile).toHaveTextContent('')
  })

  it('should handle long text', () => {
    const longText = 'has traveled to more than 10 countries and speaks at least 3 languages fluently'
    render(<BingoTile text={longText} />)
    
    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  describe('free space behavior', () => {
    it('should show "FREE" and "SPACE" text for free space tile', () => {
      render(<BingoTile text="FREE_SPACE" isFreeSpace={true} />)
      
      expect(screen.getByText('FREE')).toBeInTheDocument()
      expect(screen.getByText('SPACE')).toBeInTheDocument()
      expect(screen.queryByText('FREE_SPACE')).not.toBeInTheDocument()
    })

    it('should not show free space text for regular tile', () => {
      render(<BingoTile text="FREE_SPACE" isFreeSpace={false} />)
      
      expect(screen.getByText('FREE_SPACE')).toBeInTheDocument()
      expect(screen.queryByText('FREE')).not.toBeInTheDocument()
      expect(screen.queryByText('SPACE')).not.toBeInTheDocument()
    })

    it('should show free space when isFreeSpace is true regardless of text', () => {
      render(<BingoTile text="some other text" isFreeSpace={true} />)
      
      expect(screen.getByText('FREE')).toBeInTheDocument()
      expect(screen.getByText('SPACE')).toBeInTheDocument()
      expect(screen.queryByText('some other text')).not.toBeInTheDocument()
    })

    it('should detect FREE_SPACE text automatically', () => {
      render(<BingoTile text="FREE_SPACE" />)
      
      expect(screen.getByText('FREE')).toBeInTheDocument()
      expect(screen.getByText('SPACE')).toBeInTheDocument()
      expect(screen.queryByText('FREE_SPACE')).not.toBeInTheDocument()
    })
  })

  describe('default props', () => {
    it('should handle missing text prop', () => {
      render(<BingoTile />)
      
      const tile = document.querySelector('.tile')
      expect(tile).toBeInTheDocument()
    })

    it('should default isFreeSpace to false', () => {
      render(<BingoTile text="test" />)
      
      const tile = document.querySelector('.tile')
      expect(tile).not.toHaveClass('freeSpace')
    })
  })

  describe('text formatting', () => {
    it('should preserve text formatting', () => {
      const text = 'has special characters: & < > " \''
      render(<BingoTile text={text} />)
      
      expect(screen.getByText(text)).toBeInTheDocument()
    })

    it('should handle text with emojis', () => {
      const text = '🎉 has celebrated with emojis 🎊'
      render(<BingoTile text={text} />)
      
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  describe('structure and styling', () => {
    it('should have proper tile structure', () => {
      render(<BingoTile text="test tile" />)
      
      const tile = document.querySelector('.tile')
      expect(tile).toBeInTheDocument()
      
      const content = tile.querySelector('.content')
      expect(content).toBeInTheDocument()
      
      const nameSpace = tile.querySelector('.nameSpace')
      expect(nameSpace).toBeInTheDocument()
    })

    it('should have correct content structure for regular tile', () => {
      render(<BingoTile text="regular prompt" />)
      
      const promptText = document.querySelector('.promptText')
      expect(promptText).toBeInTheDocument()
      expect(promptText).toHaveTextContent('regular prompt')
    })

    it('should have correct content structure for free space', () => {
      render(<BingoTile isFreeSpace={true} />)
      
      const freeText = document.querySelector('.freeSpaceText')
      const spaceText = document.querySelector('.freeSpaceSubtext')
      
      expect(freeText).toBeInTheDocument()
      expect(freeText).toHaveTextContent('FREE')
      expect(spaceText).toBeInTheDocument()
      expect(spaceText).toHaveTextContent('SPACE')
    })
  })

  describe('CSS class application', () => {
    it('should apply freeSpace class when isFreeSpace is true', () => {
      render(<BingoTile text="test" isFreeSpace={true} />)
      
      const tile = document.querySelector('.tile')
      expect(tile).toHaveClass('freeSpace')
    })

    it('should apply freeSpace class for FREE_SPACE text', () => {
      render(<BingoTile text="FREE_SPACE" />)
      
      const tile = document.querySelector('.tile')
      expect(tile).toHaveClass('freeSpace')
    })

    it('should not apply freeSpace class for regular tiles', () => {
      render(<BingoTile text="regular prompt" />)
      
      const tile = document.querySelector('.tile')
      expect(tile).not.toHaveClass('freeSpace')
    })
  })
})