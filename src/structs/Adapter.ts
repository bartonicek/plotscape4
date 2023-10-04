import { Contexts } from "../dom/plot/Context";
import { PlotScales } from "../dom/plot/makeScales";
import { PartitionSet } from "./PartitionSet";

export class Adapter {
  constructor(
    public contexts: Contexts,
    public partitionSet: PartitionSet<any>,
    public scales: PlotScales
  ) {}

  partData = (depth: number) => this.partitionSet.partData(depth);
  scaleX = (x: any) => this.scales.inner.data.x.pushforward(x);
  scaleY = (y: any) => this.scales.inner.data.y.pushforward(y);
}
