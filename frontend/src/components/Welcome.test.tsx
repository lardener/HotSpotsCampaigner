import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Welcome } from './Welcome';

describe('Welcome Component', () => {
  it('should display welcome message with user name', () => {
    render(<Welcome userName="John Doe" />);
    expect(screen.getByText(/welcome john doe to the mercenary life/i)).toBeTruthy();
  });

  it('should center the welcome message', () => {
    const { container } = render(<Welcome userName="Jane Smith" />);
    const welcomeDiv = container.firstChild as HTMLElement;
    expect(welcomeDiv?.classList.contains('welcome-container')).toBe(true);
  });
});
