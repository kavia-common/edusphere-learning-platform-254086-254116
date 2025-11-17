import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders home page title', () => {
  render(<BrowserRouter><App /></BrowserRouter>);
  const title = screen.getByText(/Welcome to EduSphere/i);
  expect(title).toBeInTheDocument();
});
