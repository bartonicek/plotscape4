import graphicParameters from "../dom/graphicParameters";
import { Plot } from "../dom/plot/Plot";
import { makeCanvasContext } from "../dom/plot/makeCanvasContext";
import { PlotStore } from "../dom/plot/makePlotStore";
import { Dict } from "../utils/types";
import { Decoration } from "./Decoration";

const axisAlign = {
  x: {
    textBaseline: "top",
    textAlign: "center",
  },
  y: {
    textBaseline: "middle",
    textAlign: "center",
  },
} as const;

export class AxisTitle implements Decoration {
  along: "x" | "y";
  title: string;
  context: CanvasRenderingContext2D;
  scales: Dict;
  store: PlotStore;

  constructor(plot: Plot, along: "x" | "y", title: string) {
    this.along = along;
    this.title = title;
    this.context = makeCanvasContext(plot, {
      inner: false,
      classes: ["over"],
    });
    this.scales = plot.scales.outer.pct;
    this.store = plot.store;
  }

  draw = () => {
    const { context, scales, along, title, store } = this;

    const scale = scales[along];

    const { height, marginLeft, marginBottom } = store;
    const { fontsize } = graphicParameters;

    const yBase = height() - marginBottom() / 2;
    const xBase = marginLeft() / 2;
    const primary = scale.pushforward(0.5);

    clear(context);

    context.textBaseline = axisAlign[along].textBaseline;
    context.textAlign = axisAlign[along].textAlign;

    if (along === "x") text(context, title, primary, yBase, { fontsize });
    else text(context, title, xBase, primary, { fontsize, vertical: true });
  };
}
