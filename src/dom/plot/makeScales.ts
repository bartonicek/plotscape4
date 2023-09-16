import { Scale, ScalePlaceholder } from "../../scales/Scale";
import { PlotExpanses } from "./makeExpanses";

const makeScales = (expanses: PlotExpanses) => {
  const { outerH, outerV, innerH, innerV, normX, normY } = expanses;

  return {
    inner: {
      data: {
        x: ScalePlaceholder.default()
          .setCodomain(innerH.lower, innerH.upper)
          .setNorm(normX.lower, normX.upper),
        y: ScalePlaceholder.default()
          .setCodomain(innerV.lower, innerV.upper)
          .setNorm(normY.lower, normY.upper),
      },
    },
    outer: {
      data: {
        x: ScalePlaceholder.default()
          .setCodomain(outerH.lower, outerH.upper)
          .setNorm(normX.lower, normX.upper),
        y: ScalePlaceholder.default()
          .setCodomain(outerV.lower, outerV.upper)
          .setNorm(normY.lower, normY.upper),
      },
    },
  };
};

export default makeScales;
export type PlotScales = {
  inner: {
    data: {
      x: Scale;
      y: Scale;
    };
  };
  outer: {
    data: {
      x: Scale;
      y: Scale;
    };
  };
};
