import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('AI Study Assistant', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders StudyAI', () => {
    render(<App />);

    expect(screen.getByText('StudyAI')).toBeTruthy();
    expect(screen.getByText('AI Assistant Online')).toBeTruthy();
    expect(screen.getByText('Learn smarter.')).toBeTruthy();
  });

  it('renders the main input', () => {
    render(<App />);

    const input = screen.getByPlaceholderText(/Ask anything/i);

    expect(input).toBeTruthy();
  });

  it('renders Explain with AI button', () => {
    render(<App />);

    const button = screen.getByRole('button', {
      name: /Explain with AI/i,
    });

    expect(button).toBeTruthy();
  });

  it('renders example questions', () => {
    render(<App />);

    expect(
      screen.getByRole('button', {
        name: /Explain Fourier Transform in simple words/i,
      })
    ).toBeTruthy();

    expect(
      screen.getByRole('button', {
        name: /What is IoT and how does it work/i,
      })
    ).toBeTruthy();

    expect(
      screen.getByRole('button', {
        name: /Explain Newton’s laws with examples/i,
      })
    ).toBeTruthy();
  });

  it('fills input when an example is clicked', () => {
    render(<App />);

    const exampleButton = screen.getByRole('button', {
      name: /Explain Fourier Transform in simple words/i,
    });

    fireEvent.click(exampleButton);

    const input = screen.getByPlaceholderText(/Ask anything/i);

    expect(input.value).toBe(
      'Explain Fourier Transform in simple words'
    );
  });

  it('shows error for empty submission', () => {
    render(<App />);

    const button = screen.getByRole('button', {
      name: /Explain with AI/i,
    });

    fireEvent.click(button);

    expect(
      screen.getByRole('alert').textContent
    ).toContain('Please enter a topic or question.');
  });

  it('calls backend and displays AI response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer:
              'Fourier Transform converts a signal from time domain to frequency domain.',
          }),
      })
    );

    render(<App />);

    const input = screen.getByPlaceholderText(/Ask anything/i);

    fireEvent.change(input, {
      target: {
        value: 'What is Fourier Transform?',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Explain with AI/i,
      })
    );

    const response = await screen.findByText(
      /Fourier Transform converts a signal/i
    );

    expect(response).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    global.fetch = vi.fn(
      () => new Promise(() => {})
    );

    render(<App />);

    const input = screen.getByPlaceholderText(/Ask anything/i);

    fireEvent.change(input, {
      target: {
        value: 'Explain IoT',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Explain with AI/i,
      })
    );

    expect(screen.getByText('Thinking...')).toBeTruthy();
  });

  it('shows backend error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: 'Server error',
          }),
      })
    );

    render(<App />);

    const input = screen.getByPlaceholderText(/Ask anything/i);

    fireEvent.change(input, {
      target: {
        value: 'Explain IoT',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Explain with AI/i,
      })
    );

    const error = await screen.findByRole('alert');

    expect(error.textContent).toContain(
      'Unable to generate the explanation'
    );
  });

  it('clears the generated answer', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            answer: 'This is a test AI explanation.',
          }),
      })
    );

    render(<App />);

    const input = screen.getByPlaceholderText(/Ask anything/i);

    fireEvent.change(input, {
      target: {
        value: 'Explain AI',
      },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Explain with AI/i,
      })
    );

    await screen.findByText(
      /This is a test AI explanation/i
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Clear/i,
      })
    );

    expect(
      screen.queryByText(/This is a test AI explanation/i)
    ).toBeNull();
  });
});