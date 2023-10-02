import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { FactorMono } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";
import { sig } from "../structs/ValueLike";
import { Discrete, Numeric } from "../structs/Variable";
import { noop, values } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

export class BarPlot<
  T extends Cols,
  K extends KeysOfType<T, Discrete>,
  U extends Dataframe<{ var1: Discrete }>
> {
  data: Dataframe<{ var1: Discrete }>;
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(public scene: Scene<T>, public mapping: { var1: K }) {
    this.data = scene.data.select(mapping) as unknown as U;
    this.plot = new Plot(scene);

    const whole = () => FactorMono.of(scene.data.meta.n);
    const factor = this.data.cols.var1.factor;
    const marker = scene.marker.factor;

    const factors = [whole, factor, marker];

    const { data, plot } = this;

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
      scale.data.x = scale.data.x.setValues!(
        sig(() =>
          Array.from((partitionSet.partData(1).cols.x as Discrete).meta.values)
        )
      );
      scale.data.y = scale.data.y.setDomain!(
        num(0),
        sig(() => (partitionSet.partData(1).cols.y1 as Numeric).meta.max)
      );
    }

    this.plot.store.setNormYLower = noop;

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const bars = new Bars(adapter);

    plot.pushRepresentation(bars);
  }
}
