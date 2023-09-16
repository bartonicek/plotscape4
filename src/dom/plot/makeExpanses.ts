import { Expanse } from "../../scales/Expanse";
import { num } from "../../structs/Scalar";
import { sig } from "../../structs/ValueLike";
import { PlotStore } from "./makePlotStore";

const makeExpanses = (store: PlotStore) => {
  return {
    outerH: Expanse.default().setSignals(
      sig(store.innerLeft),
      sig(store.innerRight)
    ),
    outerV: Expanse.default().setSignals(
      sig(store.innerBottom),
      sig(store.innerTop)
    ),
    innerH: Expanse.default().setSignals(num(0), sig(store.innerWidth)),
    innerV: Expanse.default().setSignals(num(0), sig(store.innerHeight)),
    normX: Expanse.default().setSignals(
      sig(store.normXLower),
      sig(store.normXUppper)
    ),
    normY: Expanse.default().setSignals(
      sig(store.normYLower),
      sig(store.normYUpper)
    ),
  };
};

export type PlotExpanses = ReturnType<typeof makeExpanses>;
export default makeExpanses;
