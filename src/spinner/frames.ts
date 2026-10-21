export interface SpinnerStyle {
  frames: readonly string[];
  /** Milliseconds between frames. */
  interval: number;
}

export const spinners = {
  dots: {frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], interval: 80},
  line: {frames: ['-', '\\', '|', '/'], interval: 120},
  pulse: {frames: ['·', '•', '●', '•'], interval: 160},
} as const satisfies Record<string, SpinnerStyle>;

export type SpinnerName = keyof typeof spinners;
