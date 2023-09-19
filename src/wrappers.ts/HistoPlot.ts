import { createSignal } from "solid-js";
import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Rects from "../representations/Rects";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { FactorMono } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";
import { sig } from "../structs/ValueLike";
import { Numeric } from "../structs/Variable";
import { values } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

export class HistoPlot<T extends Cols, K extends KeysOfType<T, Numeric>> {
  data: Dataframe<{ var1: Numeric }>;
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(public scene: Scene<T>, public mapping: { var1: K }) {
    const data = scene.data.select(mapping);
    this.data = data;

    const plot = new Plot(scene);
    this.plot = plot;

    const [width, setWidth] = createSignal(5);
    const [anchor, setAnchor] = createSignal(0);

    this.plot.keyActions["Equal"] = () => setWidth((w) => (w * 10) / 9);
    this.plot.keyActions["Minus"] = () => setWidth((w) => (w * 9) / 10);
    this.plot.keyActions["BracketRight"] = () => setAnchor((a) => a + 1);
    this.plot.keyActions["BracketLeft"] = () => setAnchor((a) => a - 1);

    const whole = () => FactorMono.of(scene.data.meta.n);
    const bins = () => {
      return (scene.data.cols[mapping.var1] as Numeric).bin(
        sig(width),
        sig(anchor)
      );
    };
    const marker = scene.marker.factor;

    const factors = [whole, bins, marker];

    const partitionSet = new PartitionSet(factors, data)
      .reduce(
        ({ count }, {}) => ({ count: count.inc() }),
        () => ({ count: num(0) })
      )
      .map(({ binMin, binMax, count }) => ({
        x0: binMin,
        x1: binMax,
        y0: num(0),
        y1: count,
      }))
      .stackAt(
        2,
        (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
        () => ({ y0: num(0), y1: num(0) })
      )
      .update();

    this.partitionSet = partitionSet;

    for (const scale of values(plot.scales)) {
      scale.data.x = scale.data.x.setDomain!(
        sig(() => partitionSet.partData(1).cols.x0.meta.min),
        sig(() => partitionSet.partData(1).cols.x1.meta.max)
      );
      scale.data.y = scale.data.y.setDomain!(
        num(0),
        sig(() => partitionSet.partData(1).cols.y1.meta.max)
      );
    }

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const bars = new Rects(adapter);

    plot.pushRepresentation(bars);
  }
}
