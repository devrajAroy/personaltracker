import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the motivation section', () => {
  render(<App />);

  expect(screen.getByText(/daily motivation/i)).toBeInTheDocument();
});
