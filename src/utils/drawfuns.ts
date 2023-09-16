import graphicParameters from "../dom/graphicParameters";

type DefaultRepOptions = { color: string; alpha: number; stroke: string };
const defaultRepOptions = { color: "black", alpha: 1 };

export const drawClear = (context: CanvasRenderingContext2D) => {
  const { width, height } = context.canvas.getBoundingClientRect();
  context.clearRect(0, 0, width, height);
};

type RectangleOptions = DefaultRepOptions;
const defaultRectangleOptions = defaultRepOptions;

export const drawRect = (
  context: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  options?: Partial<RectangleOptions>
) => {
  const [w, h] = [x1 - x0, y1 - y0];
  const { height } = context.canvas.getBoundingClientRect();
  const opts = Object.assign({}, defaultRectangleOptions, options);

  context.save();
  context.fillStyle = opts.color;
  context.globalAlpha = opts.alpha;
  context.fillRect(x0, height - y0, w, -h);
  if (options?.stroke) {
    context.strokeStyle = options.stroke;
    context.strokeRect(x0, height - y0, w, -h);
  }
  context.restore();
};

type PointOptions = DefaultRepOptions & { radius: number };
const defaultPointOptions = {
  ...defaultRepOptions,
  radius: graphicParameters.radius,
};

export const drawPoint = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  options?: Partial<PointOptions>
) => {
  const { height } = context.canvas.getBoundingClientRect();
  const opts = Object.assign({}, defaultPointOptions, options);

  context.save();
  context.fillStyle = opts.color;
  context.globalAlpha = opts.alpha;

  context.beginPath();
  context.arc(x, height - y, opts.radius, 0, 2 * Math.PI, false);
  context.fill();
  if (opts.stroke) {
    context.strokeStyle = opts.stroke;
    context.stroke();
  }

  context.restore();
};

type TextOptions = { fontsize: number; fontfamily: string; vertical: boolean };

export function drawText(
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  options?: Partial<TextOptions>
) {
  context.save();
  context.translate(x, y);
  if (options?.vertical) context.rotate(-Math.PI / 2);
  context.font = `${options?.fontsize ?? `10`}px ${
    options?.fontfamily ?? `Arial`
  }`;
  context.fillText(label, 0, 0);
  context.translate(-x, -y);
  context.restore();
}
