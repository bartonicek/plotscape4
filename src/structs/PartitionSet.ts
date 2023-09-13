import { Accessor } from "solid-js";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/Factor";
import { Cols } from "../utils/types";
import { Composer } from "./Composer";
import { Partition } from "./Partition";

export class PartitionSet<T extends Cols, U extends Accessor<Factor>[]> {
  partitions: Partition<any>[];

  constructor(
    public factors: U,
    public data: Dataframe<T>,
    public composer: Composer<T, any>
  ) {
    this.partitions = [];

    let partition = new Partition(factors.shift()!, data, composer);
    this.partitions.push(partition);

    for (const factor of factors) {
      partition = partition.nest(factor);
      this.partitions.push(partition);
    }
  }

  partData = (index: number) => this.partitions[index].partData();
}
