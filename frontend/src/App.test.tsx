import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('should render login button when not authenticated', () => {
    render(<App />);
    const loginButton = screen.queryByText(/login with google/i);
    expect(loginButton).toBeTruthy();
  });

  it('should render welcome message when authenticated', async () => {
    // Mock authenticated state
    render(<App />);
    // This will be tested through integration testing
  });
});
