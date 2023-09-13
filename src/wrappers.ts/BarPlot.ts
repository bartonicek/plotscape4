import { Plot } from "../dom/plot/Plot";
import { Scene } from "../dom/scene/Scene";
import { Composer } from "../structs/Composer";
import { PartitionSet } from "../structs/PartitionSet";
import { Dis, num } from "../structs/Scalar";
import { SignalStore } from "../structs/SignalStore";
import { Discrete } from "../structs/Variable";

export class BarPlot<T extends { var1: Discrete }> {
  store: SignalStore<any, any>;
  composer: Composer<{}, { label: Dis }>;
  partitionSet: PartitionSet<T, any>;

  constructor(public scene: Scene<T>) {
    const plot = new Plot(scene);

    const store = SignalStore.default().bind({
      factor: scene.data.cols.var1.factor,
      marker: scene.marker.factor,
    });

    const composer = Composer.default<{}, { label: Dis }>()
      .reduce(
        ({ sum }, {}) => ({ sum: sum.inc() }),
        () => ({ sum: num(0) })
      )
      .map(({ label, sum }) => ({ x: label, y0: num(0), y1: sum }))
      .stack(
        (parent, part) => ({ y0: parent.y1, y1: parent.y1.add(part.y1) }),
        () => ({ y0: num(0), y1: num(0) })
      );

    const factors = store.extract(({ factor, marker }) => [factor, marker]);
    const partitionSet = new PartitionSet(factors, scene.data, composer as any);

    this.composer = composer;
    this.store = store;
    this.partitionSet = partitionSet as any;
  }
}
