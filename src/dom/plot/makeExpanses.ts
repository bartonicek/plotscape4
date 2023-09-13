import { createSignal } from "solid-js";
import { just } from "../../utils/funs";
import { Expanse } from "../../scales.ts/Expanse";
import { PlotStore } from "./makePlotStore";

const makeExpanses = (store: PlotStore) => {
  return {
    outerH: Expanse.default().setSignals(just(0), store.width),
    outerV: Expanse.default().setSignals(just(0), store.height),
    innerH: Expanse.default().setSignals(store.innerLeft, store.innerRight),
    innerV: Expanse.default().setSignals(store.innerBottom, store.innerTop),
    normX: Expanse.default().setSignals(store.normXLower, store.normXUppper),
    normY: Expanse.default().setSignals(store.normYLower, store.normYUpper),
  };
};

export type PlotExpanses = ReturnType<typeof makeExpanses>;
export default makeExpanses;
