import { expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the dashboard overview, notifications, countdown deadlines, and habit consistency area', () => {
  render(<App />);

  expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();
  expect(screen.getByText(/notifications/i)).toBeInTheDocument();
  expect(screen.getByText(/countdown deadlines/i)).toBeInTheDocument();
  expect(screen.getAllByText(/habit consistency/i).length).toBeGreaterThan(0);
});

test('opens a dedicated Pomodoro timer page from the dashboard overview', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /open pomodoro timer/i }));

  expect(screen.getByText(/pomodoro workspace/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
});
