import { ScalePlaceholder } from "../../scales.ts/ScalePlaceholder";
import { PlotExpanses } from "./makeExpanses";

const makeScales = (expanses: PlotExpanses) => {
  return {
    data: {
      inner: {
        x: new ScalePlaceholder()
          .setCodomain(expanses.outerH)
          .setNorm(expanses.normX),
        y: new ScalePlaceholder()
          .setCodomain(expanses.outerV)
          .setNorm(expanses.normY),
      },
      outer: {
        x: new ScalePlaceholder()
          .setCodomain(expanses.innerH)
          .setNorm(expanses.normX),
        y: new ScalePlaceholder()
          .setCodomain(expanses.innerV)
          .setNorm(expanses.normY),
      },
    },
  };
};

export default makeScales;
export type PlotScales = ReturnType<typeof makeScales>;
