import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Points from "../representations/Points";
import { Adapter } from "../structs/Adapter";
import { Dataframe } from "../structs/Dataframe";
import { FactorIso, FactorMono } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { sig } from "../structs/ValueLike";
import { Numeric } from "../structs/Variable";
import { values } from "../utils/funs";
import { Cols, KeysOfType } from "../utils/types";

export class ScatterPlot<T extends Cols> {
  data: Dataframe<{ var1: Numeric; var2: Numeric }>;
  plot: Plot;
  partitionSet: PartitionSet<any>;

  constructor(
    public scene: Scene<T>,
    public mappingfn: (cols: Pick<T, KeysOfType<T, Numeric>>) => {
      var1: Numeric;
      var2: Numeric;
    }
  ) {
    this.data = scene.data.select(mappingfn);
    this.plot = new Plot(scene);

    const whole = () => FactorMono.of(scene.data.meta.n);
    const factor = () => FactorIso.of(scene.data.meta.n);
    const marker = scene.marker.factor;

    const factors = [whole, factor, marker];

    const { data, plot } = this;

    const partitionSet = new PartitionSet(factors, data)
      .map(({ var1, var2 }) => ({ x: var1, y: var2 }))
      .update();

    this.partitionSet = partitionSet;

    for (const scale of values(plot.scales)) {
      scale.data.x = scale.data.x.setDomain!(
        sig(() => (partitionSet.partData(2).cols.x as Numeric).meta.min),
        sig(() => (partitionSet.partData(2).cols.x as Numeric).meta.max)
      );
      scale.data.y = scale.data.y.setDomain!(
        sig(() => (partitionSet.partData(2).cols.y as Numeric).meta.min),
        sig(() => (partitionSet.partData(2).cols.y as Numeric).meta.max)
      );
    }

    const adapter = new Adapter(plot.contexts, partitionSet, plot.scales);
    const points = new Points(adapter);

    plot.pushRepresentation(points);
  }
}
