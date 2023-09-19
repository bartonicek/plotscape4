import { Accessor } from "solid-js";
import { Dataframe } from "../structs/Dataframe";
import { Factor } from "../structs/Factor";
import { POJO, identity, secondArgument } from "../utils/funs";
import { Cols, JustFn, MapFn, ReduceFn, Row, RowOf } from "../utils/types";
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

  reduceAt = <U>(
    index: number,
    reducefn: ReduceFn<RowOf<T>, U>,
    init: JustFn<U>
  ) => {
    this.partitions[index].setReduce(reducefn, init);
    return this;
  };

  reduce = <U>(reducefn: ReduceFn<RowOf<T>, U>, init: JustFn<U>) => {
    for (const partition of this.partitions)
      partition.setReduce(reducefn, init);
    return this;
  };

  mapAt = <U extends Row, V extends Row>(index: number, mapfn: MapFn<U, V>) => {
    this.partitions[index].setMap(mapfn);
    return this;
  };

  map = <U extends Row, V extends Row>(mapfn: MapFn<U, V>) => {
    for (const partition of this.partitions) partition.setMap(mapfn);
    return this;
  };

  stackAt = <U extends Row>(
    index: number,
    stackfn: ReduceFn<U, U>,
    init: JustFn<U>
  ) => {
    this.partitions[index].setStack(stackfn, init);
    return this;
  };

  stack = <U extends Row>(stackfn: ReduceFn<U, U>, init: JustFn<U>) => {
    for (const partition of this.partitions) partition.setStack(stackfn, init);
    return this;
  };

  partData = (index: number) => this.partitions[index].partData?.();
  update = () => {
    for (const partition of this.partitions) partition.update();
    return this;
  };
}
