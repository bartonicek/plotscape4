import { Accessor, createMemo, untrack } from "solid-js";
import { Dataframe } from "../structs/Dataframe";
import { Factor, FactorProduct } from "../structs/Factor";
import { ref } from "../structs/Scalar";
import { keys, values } from "../utils/funs";
import { Cols, JustFn, MapFn, ReduceFn, Scalar } from "../utils/types";
import { IndexMap } from "./IndexMap";

export const stackSymbol = Symbol.for("stack");
export const parentSymbol = Symbol.for("parent");

export class Partition<T extends Cols> {
  parts: Accessor<Record<number, Record<string | symbol, Scalar>>>;
  partData: Accessor<Dataframe<Cols>>;

  constructor(
    public factor: Accessor<Factor>,
    public data: Dataframe<T>,
    public reducefn: ReduceFn<any, any>,
    public reduceinit: JustFn<any>,
    public mapfn: MapFn<any, any>,
    public stackfn: ReduceFn<any, any>,
    public stackinit: JustFn<any>,
    public parent?: Partition<any>
  ) {
    this.parts = createMemo(() => this.getParts());
    this.partData = createMemo(() => this.getPartData());
  }

  nest = (childFactor: Accessor<Factor>) => {
    const { data, factor, reducefn, reduceinit, mapfn, stackfn, stackinit } =
      this;

    const product = () => FactorProduct.from(factor(), childFactor());
    const childPartition = new Partition(
      product,
      data,
      reducefn,
      reduceinit,
      mapfn,
      stackfn,
      stackinit,
      this
    );
    return childPartition;
  };

  update = () => {
    this.parts = createMemo(() => this.getParts());
    this.partData = createMemo(() => this.getPartData());
  };

  getParts = () => {
    const factor = this.factor();
    const { data, parent } = this;

    const indices = factor.indices();

    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentParts = parent?.parts() ?? {};
    for (const parentPart of values(parentParts)) {
      parentPart[stackSymbol] = this.stackinit();
    }

    const indexMap = new IndexMap(indices, parentFactor?.indices());
    const parts: Record<number, Record<string | symbol, Scalar>> = {};

    // Iterate length of data (n): reduce
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];

      if (!(index in parts)) parts[index] = this.reduceinit();
      parts[index] = this.reducefn(parts[index], data.row(i));
    }

    // Iterate parts: map and stack
    for (const index of keys(parts)) {
      let part = parts[index];
      const parentPart = parentParts?.[indexMap.parentIndex(index)];

      const label = factor.label(index);

      Object.assign(part, label, { parent: parentPart });
      part = this.mapfn(parts[index]);
      part.positions = ref(factor.positions(index));

      if (label.group) {
        part.group = label.group;
        part.transient = label.transient;
        part.layer = label.layer;
      }

      if (!parentPart) {
        parts[index] = part;
        continue;
      }

      part.parent = ref(parentPart);
      const stacked = this.stackfn(parentPart[stackSymbol], part);

      parentPart[stackSymbol] = stacked;
      Object.assign(part, stacked);

      parts[index] = part;
    }

    // Clean up stacking prop
    for (const parentPart of values(parentParts)) {
      delete parentPart[stackSymbol];
    }

    return parts;
  };

  getPartData = () => {
    const parts = values(this.parts());

    const resultData = Dataframe.fromRow(parts[0]);
    for (let i = 1; i < parts.length; i++) resultData.push(parts[i]);

    return resultData;
  };
}
