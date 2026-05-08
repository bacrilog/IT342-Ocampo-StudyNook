import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('renders StudyNook landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /studynook/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});

test('navigates to sign in screen', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

test('navigates to sign up screen', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});
