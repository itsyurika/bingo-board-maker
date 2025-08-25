import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Header from '../Header.jsx';

describe('Header', () => {
  it('should render with default props', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should render custom title', () => {
    const customTitle = 'Custom Event Title';
    render(<Header title={customTitle} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(customTitle);
  });

  it('should render custom instructions', () => {
    const customInstructions = 'These are custom instructions';
    render(<Header instructions={customInstructions} />);

    expect(screen.getByText(customInstructions)).toBeInTheDocument();
  });

  it('should render custom subtitle', () => {
    const customSubtitle = 'Custom Subtitle';
    render(<Header subtitle={customSubtitle} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(customSubtitle);
  });

  it('should render all custom props together', () => {
    const props = {
      title: 'Test Event',
      instructions: 'Test instructions',
      subtitle: 'Test subtitle'
    };

    render(<Header {...props} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(props.title);
    expect(screen.getByText(props.instructions)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(props.subtitle);
  });

  it('should handle empty strings gracefully', () => {
    const props = {
      title: '',
      instructions: '',
      subtitle: ''
    };

    render(<Header {...props} />);

    // Elements should still be rendered but empty
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('');
  });

  it('should have proper semantic structure', () => {
    render(<Header title="Test" instructions="Test instructions" subtitle="Test subtitle" />);

    const header = screen.getByRole('banner');
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    const p = screen.getByText('Test instructions');

    // Check hierarchy
    expect(header).toContainElement(h1);
    expect(header).toContainElement(p);
    expect(header).toContainElement(h2);
  });

  it('should apply correct CSS classes', () => {
    render(<Header />);

    const header = screen.getByRole('banner');
    // CSS modules generate hashed class names, so we check that it has a class
    expect(header.className).toMatch(/header/);
  });

  describe('default values', () => {
    it('should use default title when not provided', () => {
      render(<Header />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent).toContain('2025 Priceline Summer Party');
    });

    it('should use default instructions when not provided', () => {
      render(<Header />);

      expect(screen.getByText(/You can use the same person only twice/)).toBeInTheDocument();
    });

    it('should use default subtitle when not provided', () => {
      render(<Header />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2.textContent).toContain('Find someone who');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Header />);

      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    it('should be identified as banner landmark', () => {
      render(<Header />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});