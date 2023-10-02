import { Accessor } from "solid-js";
import graphicParameters from "../dom/graphicParameters";
import { Plot } from "../dom/plot/Plot";
import { makeCanvasContext } from "../dom/plot/makeCanvasContext";
import { PlotStore } from "../dom/plot/makePlotStore";
import { Scale } from "../scales/Scale";
import { drawClear, drawText } from "../utils/drawfuns";

const axisAlign = {
  x: {
    textBaseline: "top",
    textAlign: "center",
  },
  y: {
    textBaseline: "middle",
    textAlign: "right",
  },
} as const;

export class AxisLabels<T extends string | number> {
  at?: Accessor<T[]>;
  labels?: Accessor<T[]>;
  along: "x" | "y";
  tol: number;
  context: CanvasRenderingContext2D;
  scales: { x: Scale; y: Scale };
  store: PlotStore;

  constructor(plot: Plot, along: "x" | "y") {
    this.along = along;
    this.tol = 0;
    this.context = makeCanvasContext(plot, {
      classes: ["margin"],
      inner: false,
    });
    this.scales = plot.scales.outer.data;
    this.store = plot.store;
  }

  setValues = (at: Accessor<T[]>, labels: Accessor<T[]>) => {
    this.at = at;
    this.labels = labels;
  };

  draw = () => {
    const { context, scales, along, store } = this;

    const scale = scales[along];
    const at = this.at?.() ?? scale.breaks();
    let labels = this.labels?.() ?? scale.breaks();

    // if (typeof labels[0] === "number") labels = labels.map(round(2));

    const { height, innerBottom, innerTop, innerLeft, innerRight } = store;
    const { fontsize } = graphicParameters;

    const yBase = height() - innerBottom() + graphicParameters.axisOffset;
    const xBase = innerLeft() - graphicParameters.axisOffset;

    drawClear(context);

    context.textBaseline = axisAlign[along].textBaseline;
    context.textAlign = axisAlign[along].textAlign;

    let lastX = 0;

    if (along === "x") {
      for (let i = 0; i < at.length; i++) {
        const label = labels[i];
        const x = scale.pushforward(at[i]);
        const { width: w } = context.measureText(label);
        const wh = w / 2;

        if (x - wh < innerLeft() || x + wh > innerRight()) continue;
        if (x - w < lastX) continue; // Check label overlap

        drawText(context, label, x, yBase, { fontsize });
        lastX = x + w;
      }
    } else if (along === "y") {
      for (let i = 0; i < at.length; i++) {
        const label = at[i].toString();
        const y = scale.pushforward(at[i]);
        const { actualBoundingBoxAscent: h } = context.measureText(label);
        const hh = h / 2;

        if (y - hh < innerBottom() || y + hh > innerTop()) continue;
        drawText(context, label, xBase, height() - y, { fontsize });
      }
    }
  };
}
