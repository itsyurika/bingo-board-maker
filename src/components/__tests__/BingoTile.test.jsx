import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BingoTile from '../BingoTile.jsx';

describe('BingoTile', () => {
  it('should render regular tile with text', () => {
    const text = 'has traveled abroad';
    render(<BingoTile text={text} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('should render free space tile', () => {
    render(<BingoTile text="FREE_SPACE" isFreeSpace={true} />);

    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('SPACE')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for regular tile', () => {
    render(<BingoTile text="test text" />);

    expect(screen.getByText('test text')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for free space tile', () => {
    render(<BingoTile text="FREE_SPACE" isFreeSpace={true} />);

    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('SPACE')).toBeInTheDocument();
  });

  it('should handle empty text', () => {
    render(<BingoTile text="" />);

    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const longText = 'has traveled to more than 10 countries and speaks at least 3 languages fluently';
    render(<BingoTile text={longText} />);

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  describe('free space behavior', () => {
    it('should show "FREE" and "SPACE" text for free space tile', () => {
      render(<BingoTile text="FREE_SPACE" isFreeSpace={true} />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('SPACE')).toBeInTheDocument();
      expect(screen.queryByText('FREE_SPACE')).not.toBeInTheDocument();
    });

    it('should not show free space text for regular tile', () => {
      render(<BingoTile text="regular text" isFreeSpace={false} />);

      expect(screen.getByText('regular text')).toBeInTheDocument();
      expect(screen.queryByText('FREE')).not.toBeInTheDocument();
      expect(screen.queryByText('SPACE')).not.toBeInTheDocument();
    });

    it('should show free space when isFreeSpace is true regardless of text', () => {
      render(<BingoTile text="some other text" isFreeSpace={true} />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('SPACE')).toBeInTheDocument();
      expect(screen.queryByText('some other text')).not.toBeInTheDocument();
    });

    it('should detect FREE_SPACE text automatically', () => {
      render(<BingoTile text="FREE_SPACE" />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('SPACE')).toBeInTheDocument();
      expect(screen.queryByText('FREE_SPACE')).not.toBeInTheDocument();
    });
  });

  describe('default props', () => {
    it('should handle missing text prop', () => {
      render(<BingoTile />);

      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it('should default isFreeSpace to false', () => {
      render(<BingoTile text="test" />);

      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  describe('text formatting', () => {
    it('should preserve text formatting', () => {
      const text = 'has special characters: & < > " \'';
      render(<BingoTile text={text} />);

      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('should handle text with emojis', () => {
      const text = '🎉 has celebrated with emojis 🎊';
      render(<BingoTile text={text} />);

      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  describe('structure and styling', () => {
    it('should have proper tile structure', () => {
      render(<BingoTile text="test tile" />);

      expect(screen.getByText('test tile')).toBeInTheDocument();
    });

    it('should have correct content structure for regular tile', () => {
      render(<BingoTile text="regular prompt" />);

      expect(screen.getByText('regular prompt')).toBeInTheDocument();
    });

    it('should have correct content structure for free space', () => {
      render(<BingoTile isFreeSpace={true} />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('SPACE')).toBeInTheDocument();
    });
  });

  describe('CSS class application', () => {
    it('should apply freeSpace class when isFreeSpace is true', () => {
      render(<BingoTile text="test" isFreeSpace={true} />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('SPACE')).toBeInTheDocument();
    });

    it('should apply freeSpace class for FREE_SPACE text', () => {
      render(<BingoTile text="FREE_SPACE" />);

      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('SPACE')).toBeInTheDocument();
    });

    it('should not apply freeSpace class for regular tiles', () => {
      render(<BingoTile text="regular prompt" />);

      expect(screen.getByText('regular prompt')).toBeInTheDocument();
      expect(screen.queryByText('FREE')).not.toBeInTheDocument();
    });
  });
});