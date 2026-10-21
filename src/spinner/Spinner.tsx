import {useEffect, useState} from 'react';
import {Box, Text} from 'ink';
import {useTheme} from '../theme/index.js';
import {spinners, type SpinnerName, type SpinnerStyle} from './frames.js';

export type SpinnerState = 'running' | 'done' | 'failed';

export interface SpinnerProps {
  /** Text after the spinner, such as `Thinking…` or `Starting server`. */
  label?: string;
  /** A built-in style by name, or your own frames. */
  type?: SpinnerName | SpinnerStyle;
  /** `done` and `failed` stop the animation and show a mark in its place. */
  state?: SpinnerState;
  /** Spinner color. Defaults to the theme's accent. */
  color?: string;
}

/** The current frame of an animation, advancing every `interval` milliseconds while `active`. */
export const useSpinnerFrame = (style: SpinnerStyle, active = true): string => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % style.frames.length);
    }, style.interval);
    return () => clearInterval(timer);
  }, [style, active]);
  return style.frames[index % style.frames.length] ?? '';
};

export const Spinner = ({label, type = 'dots', state = 'running', color}: SpinnerProps) => {
  const theme = useTheme();
  const style = typeof type === 'string' ? spinners[type] : type;
  const frame = useSpinnerFrame(style, state === 'running');
  const mark =
    state === 'done' ? (
      <Text color={theme.success}>✓</Text>
    ) : state === 'failed' ? (
      <Text color={theme.danger}>✗</Text>
    ) : (
      <Text color={color ?? theme.accent}>{frame}</Text>
    );
  return (
    <Box gap={1}>
      {mark}
      {label !== undefined && (
        <Text color={state === 'running' ? theme.text : theme.muted}>{label}</Text>
      )}
    </Box>
  );
};
