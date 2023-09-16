import { createEffect } from "solid-js";
import html from "solid-js/html";
import { Plot } from "./Plot";

type GraphicLayerOptions = {
  inner: boolean;
  scalingFactor?: number;
  classes?: string[];
};

export const makeCanvasContext = (plot: Plot, options: GraphicLayerOptions) => {
  const scalingFactor = options.scalingFactor ?? 3;
  const canvas = html`<canvas />` as HTMLCanvasElement;

  if (options.classes) {
    for (const cssClass of options.classes) {
      canvas.classList.add(`plotscape-${cssClass}`);
    }
  }

  if (options.inner) {
    canvas.style.marginLeft = plot.store.marginLeft() + "px";
    canvas.style.marginTop = plot.store.marginTop() + "px";
  }

  plot.container.appendChild(canvas);
  const context = canvas.getContext("2d")!;

  const width = options.inner ? plot.store.innerWidth : plot.store.width;
  const height = options.inner ? plot.store.innerHeight : plot.store.height;

  createEffect(() => {
    const [w, h] = [width(), height()];
    canvas.style.width = w + `px`;
    canvas.style.height = h + `px`;
    canvas.width = Math.ceil(w * scalingFactor);
    canvas.height = Math.ceil(h * scalingFactor);
    context.scale(scalingFactor, scalingFactor);
  });

  return context;
};
