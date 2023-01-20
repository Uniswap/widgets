export enum TransitionDuration {
  Fast = 125,
  Medium = 250,
  Slow = 250,
}

export const AnimationSpeed = {
  Fast: `${TransitionDuration.Fast}ms`,
  Medium: `${TransitionDuration.Medium}ms`,
  Slow: `${TransitionDuration.Slow}ms`,
}
