import { Accessor, createMemo, untrack } from "solid-js";
import { Dataframe } from "../structs/Dataframe";
import { Factor, FactorProduct } from "../structs/Factor";
import { ref } from "../structs/Scalar";
import { keys } from "../utils/funts";
import { Cols, Scalar } from "../utils/types";
import { Composer } from "./Composer";
import { IndexMap } from "./IndexMap";

export const stackSymbol = Symbol.for("stack");
export const parentSymbol = Symbol.for("parent");

export class Partition<T extends Cols> {
  parts: Accessor<Record<number, Record<string | symbol, Scalar>>>;
  partData: Accessor<Dataframe<Cols>>;

  constructor(
    public factor: Accessor<Factor>,
    public data: Dataframe<T>,
    public composer: Composer<any, any, any>,
    public parent?: Partition<any>
  ) {
    this.parts = createMemo(this.getParts);
    this.partData = createMemo(this.getPartData);
  }

  nest = (childFactor: Accessor<Factor>) => {
    const { data, composer, factor } = this;
    const product = () => FactorProduct.from(factor(), childFactor());
    const childPartition = new Partition(product, data, composer, this);
    return childPartition;
  };

  getParts = () => {
    const factor = this.factor();
    const { data, composer, parent } = this;

    const indices = factor.indices();

    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentParts = parent?.parts();
    const indexMap = new IndexMap(indices, parentFactor?.indices());

    const parts: Record<number, Record<string | symbol, Scalar>> = {};

    // Iterate length of data (n): reduce
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];

      if (!(index in parts)) parts[index] = composer.reducer.initialfn();
      parts[index] = composer.reducer.reducefn(parts[index], data.row(i));
    }

    // Iterate parts: map and stack
    for (const index of keys(parts)) {
      const parentPart = parentParts?.[indexMap.parentIndex(index)];

      const label = factor.label(index);

      Object.assign(parts[index], label, { parent: parentPart });
      parts[index] = composer.mapper(parts[index]);
      if (label.group) {
        parts[index].group = label.group;
        parts[index].transient = label.transient;
        parts[index].layer = label.layer;
      }

      parts[index][stackSymbol] = composer.stacker.initialfn();

      if (!parentPart) continue;

      // parts[index][parentSymbol] = Ref.of(Value.of(parentPart));
      parts[index].parent = ref(parentPart);

      const stacked = composer.stacker.reducefn(
        parentPart[stackSymbol],
        parts[index]
      );

      parentPart[stackSymbol] = stacked;
      Object.assign(parts[index], stacked);
    }

    return parts;
  };

  getPartData = () => {
    const parts = Object.values(this.parts());

    const resultData = Dataframe.fromRow(parts[0]);
    for (let i = 1; i < parts.length; i++) resultData.push(parts[i]);
    return resultData;
  };
}
