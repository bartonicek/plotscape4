import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import Bars from "../representations/Bars";
import { Adapter } from "../structs/Adapter";
import { FactorMono } from "../structs/Factor";
import { PartitionSet } from "../structs/PartitionSet";
import { num } from "../structs/Scalar";
import { SignalStore } from "../structs/SignalStore";
import { sig } from "../structs/ValueLike";
import { values } from "../utils/funs";

export class BarPlot {
  plot: Plot;
  store: SignalStore<any, any>;
  partitionSet: PartitionSet<any>;

  constructor(public scene: Scene<any>, public mapping: { var1: string }) {
    const plot = new Plot(scene);
    this.plot = plot;

    const store = SignalStore.default().bind({
      whole: () => FactorMono.of(scene.data.meta.n),
      factor: scene.data.cols[mapping.var1].factor,
      marker: scene.marker.factor,
    });

    const factors = store.extract(({ whole, factor, marker }) => [
      whole,
      factor,
      marker,
    ]);

    const selectedData = scene.data.select(mapping);
    const partitionSet = new PartitionSet(factors, selectedData)
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

    this.store = store;
    this.partitionSet = partitionSet;

    for (const scale of values(plot.scales)) {
      scale.data.x = scale.data.x.setValues!(
        sig(() => store.getters.factor().meta().labels)
      );
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
