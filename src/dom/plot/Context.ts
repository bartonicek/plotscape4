export const contexts = [
  "base",
  "user",
  "over",
  1,
  2,
  3,
  4,
  129,
  130,
  131,
  132,
] as const;

export type Context = (typeof contexts)[number];
export type Contexts = Record<Context, CanvasRenderingContext2D>;
