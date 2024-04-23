import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Classroom Overview title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Classroom Overview/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Select a Class heading', () => {
  render(<App />);
  const selectClassElement = screen.getByText(/Select a Class/i);
  expect(selectClassElement).toBeInTheDocument();
});

test('renders Final Grades heading', () => {
  render(<App />);
  const finalGradesElement = screen.getByText(/Final Grades/i);
  expect(finalGradesElement).toBeInTheDocument();
});
