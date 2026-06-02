import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard overview and notifications area', () => {
  render(<App />);

  expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();
  expect(screen.getByText(/notifications/i)).toBeInTheDocument();
});
