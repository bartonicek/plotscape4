import graphicParameters from "../dom/graphicParameters";
import { Context } from "../dom/plot/Context";
import { Adapter } from "../structs/Adapter";
import {
  groupSymbol,
  groups,
  layerSymbol,
  transientSymbol,
} from "../structs/Marker";
import { drawClear, drawRect } from "../utils/drawfuns";
import { rectOverlap } from "../utils/funs";
import { Representation } from "./Representation";
import { transientOptions } from "./transientOpts";

export default class Rects implements Representation {
  constructor(private adapter: Adapter) {}

  draw = () => {
    const { contexts, partData, scaleX, scaleY } = this.adapter;

    const data2 = partData(2) as any;

    // Clear previous paints
    for (const layer of groups) drawClear(contexts[layer]);

    for (const row of data2) {
      const x0 = scaleX(row.x0.value());
      const x1 = scaleX(row.x1.value());
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      const group = row[groupSymbol].value();
      const layer = row[layerSymbol].value();
      const transient = row[transientSymbol].value();

      const context = contexts[layer as Context];
      const color = graphicParameters.groupColours[group - 1];

      drawRect(context, x0, y0, x1, y1, { alpha: 1, color });
      if (transient) drawRect(context, x0, y0, x1, y1, transientOptions);
    }
  };

  checkSelection = (coords: [number, number, number, number]) => {
    const { partData, scaleX, scaleY } = this.adapter;

    const data = partData(1);

    const selX = [coords[0], coords[2]] as [number, number];
    const selY = [coords[1], coords[3]] as [number, number];
    const selectedCases: number[] = [];

    for (const row of data) {
      const x0 = scaleX(row.x0.value());
      const x1 = scaleX(row.x1.value());
      const y0 = scaleY(row.y0.value());
      const y1 = scaleY(row.y1.value());

      if (rectOverlap([x0, x1], [y0, y1], selX, selY)) {
        selectedCases.push(...row[Symbol.for("positions")].value());
      }
    }

    return selectedCases;
  };
}
