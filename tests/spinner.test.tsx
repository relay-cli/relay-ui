import {render} from 'ink-testing-library';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Spinner, ThemeProvider, monoTheme, spinners} from '../src/index.js';

describe('Spinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // React and Ink render on later ticks, so move the clock in small steps and
  // finish a little past the frame change to let the write land.
  const advance = async (ms: number) => {
    for (let elapsed = 0; elapsed < ms + 40; elapsed += 10) {
      await vi.advanceTimersByTimeAsync(10);
    }
  };

  it('starts on the first frame with its label', () => {
    const {lastFrame} = render(<Spinner label="Thinking…" />);
    expect(lastFrame()).toBe(`${spinners.dots.frames[0]} Thinking…`);
  });

  it('moves to the next frame every interval and wraps around', async () => {
    const {lastFrame} = render(<Spinner type="line" />);
    await advance(120);
    expect(lastFrame()).toBe('\\');
    await advance(120 * 3 - 40);
    expect(lastFrame()).toBe('-');
  });

  it('accepts custom frames', async () => {
    const {lastFrame} = render(<Spinner type={{frames: ['a', 'b'], interval: 50}} />);
    await advance(50);
    expect(lastFrame()).toBe('b');
  });

  it('shows a mark and stops animating when the work finishes', async () => {
    const {lastFrame, rerender} = render(<Spinner label="Build" />);
    rerender(<Spinner label="Build" state="done" />);
    expect(lastFrame()).toBe('✓ Build');
    await advance(500);
    expect(lastFrame()).toBe('✓ Build');
    rerender(<Spinner label="Build" state="failed" />);
    expect(lastFrame()).toBe('✗ Build');
  });

  it('stops its timer when it unmounts', () => {
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const {unmount} = render(<Spinner />);
    unmount();
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });

  it('renders inside any theme', () => {
    const {lastFrame} = render(
      <ThemeProvider theme={monoTheme}>
        <Spinner label="Loading" type="pulse" />
      </ThemeProvider>,
    );
    expect(lastFrame()).toBe('· Loading');
  });
});
