import { Accessor } from "solid-js";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/Factor";
import { POJO, identity, secondArgument } from "../utils/funs";
import { Cols, JustFn, MapFn, ReduceFn } from "../utils/types";
import { Partition } from "./Partition";

export class PartitionSet<T extends Cols> {
  partitions: Partition<any>[];

  constructor(public factors: Accessor<Factor>[], public data: Dataframe<T>) {
    this.partitions = [];

    let partition = new Partition(
      factors.shift()!,
      data,
      secondArgument,
      POJO,
      identity,
      secondArgument,
      POJO
    );

    this.partitions.push(partition);

    for (const factor of factors) {
      partition = partition.nest(factor);
      this.partitions.push(partition);
    }
  }

  reduceAt = (
    index: number,
    reducefn: ReduceFn<any, any>,
    init: JustFn<any>
  ) => {
    this.partitions[index].reducefn = reducefn;
    this.partitions[index].reduceinit = init;
    return this;
  };

  reduce = (reducefn: ReduceFn<any, any>, init: JustFn<any>) => {
    for (let i = 0; i < this.partitions.length; i++) {
      this.reduceAt(i, reducefn, init);
    }
    return this;
  };

  mapAt = (index: number, mapfn: MapFn<any, any>) => {
    this.partitions[index].mapfn = mapfn;
    return this;
  };

  map = (mapfn: MapFn<any, any>) => {
    for (let i = 0; i < this.partitions.length; i++) {
      this.mapAt(i, mapfn);
    }
    return this;
  };

  stackAt = (index: number, stackfn: ReduceFn<any, any>, init: JustFn<any>) => {
    this.partitions[index].stackfn = stackfn;
    this.partitions[index].stackinit = init;
    return this;
  };

  partData = (index: number) => this.partitions[index].partData();
  update = () => {
    for (const partition of this.partitions) partition.update();
    return this;
  };
}
