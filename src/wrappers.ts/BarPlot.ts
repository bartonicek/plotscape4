import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { FactorMono } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";
import { sig } from "../structs/ValueLike";
import { Discrete } from "../structs/Variable";
import { values } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

export class BarPlot<T extends Cols, K extends KeysOfType<T, Discrete>> {
  data: Dataframe<{ var1: Discrete }>;
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(public scene: Scene<T>, public mapping: { var1: K }) {
    const data = scene.data.select(
      mapping as { var1: keyof T }
    ) as unknown as Dataframe<{
      var1: Discrete;
    }>;
    this.data = data;

    const plot = new Plot(scene);
    this.plot = plot;

    const whole = () => FactorMono.of(scene.data.meta.n);
    const factor = this.data.cols.var1.factor;
    const marker = scene.marker.factor;

    const factors = [whole, factor, marker];

    const partitionSet = new PartitionSet(factors, data)
      .reduce(
        ({ sum }, {}) => ({ sum: sum.inc() }),
        () => ({ sum: num(0) })
      )
      .map(({ label, sum }) => ({ x: label, y0: num(0), y1: sum }))
      .stackAt(
        2,
        (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
        () => ({ y0: num(0), y1: num(0) })
      )
      .update();

    this.partitionSet = partitionSet;

    for (const scale of values(plot.scales)) {
      scale.data.x = scale.data.x.setValues!(sig(() => factor().meta().labels));
      scale.data.y = scale.data.y.setDomain!(
        num(0),
        sig(() => partitionSet.partData(1).cols.y1.meta.max)
      );
    }

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const bars = new Bars(adapter);

    plot.pushRepresentation(bars);
  }
}
