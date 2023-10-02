import { Accessor, createMemo, untrack } from "solid-js";
import { Dataframe } from "../structs/Dataframe";
import { Factor, FactorProduct } from "../structs/Factor";
import { ref } from "../structs/Scalar";
import { keys, values } from "../utils/funs";
import { Cols, RowOf, Scalar } from "../utils/types";
import { IndexMap } from "./IndexMap";
import { Recipe } from "./Recipe";
import { SlidingRow } from "./SlidingRow";

export const stackSymbol = Symbol.for("stack");
export const parentSymbol = Symbol.for("parent");

export class Partition<T extends Cols> {
  parts: Accessor<Record<number, Record<string | symbol, Scalar>>>;
  partData: Accessor<Dataframe<Cols>>;

  constructor(
    public factor: Accessor<Factor>,
    public data: Dataframe<T>,
    public recipe: Recipe<RowOf<T>, any, any>,
    public parent?: Partition<any>
  ) {
    this.parts = createMemo(() => this.getParts());
    this.partData = createMemo(() => this.getPartData());
  }

  nest = (childFactor: Accessor<Factor>, recipe?: Recipe<any, any, any>) => {
    const { data, factor } = this;
    recipe = recipe ?? this.recipe;

    const product = () => FactorProduct.from(factor(), childFactor());
    const childPartition = new Partition(product, data, recipe, this);
    return childPartition;
  };

  update = () => {
    this.partData = createMemo(() => this.getPartData());
  };

  reduce = () => {
    const factor = this.factor();
    if (!this.recipe.state.reduced) return this.data;
    const { data, parent, recipe } = this;

    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentParts = parent?.parts?.() ?? {};
    for (const parentPart of values(parentParts)) {
      parentPart[stackSymbol] = recipe.stackinit();
    }

    const indices = factor.indices();
    const parentIndices = parentFactor?.indices();

    const parts: Record<number, Record<string | symbol, Scalar>> = {};
    const dataRow = SlidingRow.from(data, 0);
    const parentIndexMap: Record<number, number> = {};

    // Reduce data (length n)
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (!(index in parts)) {
        parts[index] = recipe.reduceinit();
        parentIndexMap[index] = parentIndices?.[i] ?? 0;
      }
      parts[index] = recipe.reducefn(parts[index], dataRow.values());
      dataRow.slide();
    }

    let reducedData;

    // Append parent, positions, and labels (length k)
    for (const index of factor.uniqueIndices()) {
      parts[index][parentSymbol] = ref(parentIndexMap[index]);
      parts[index].positions = ref(factor.positions(index));
      Object.assign(parts[index], factor.label(index));
      if (!reducedData) reducedData = Dataframe.fromRow(parts[index], index);
      else reducedData.push(parts[index], index);
    }

    return reducedData!;
  };

  mapAndStack = () => {
    const reducedData = this.reduce();
    const parentData = this.parent?.mapAndStack();

    const { recipe } = this;

    const row1 = reducedData.row(0);
    const mappedRow1 = recipe.mapfn(row1);
    mappedRow1.parent = row1.parent;
    mappedRow1.positions = row1.positions;
    mappedRow1.group = row1.group;
    mappedRow1.transient = row1.transient;
    mappedRow1.layer = row1.layer;

    const mappedAndStackedData = Dataframe.fromRow(mappedRow1).empty();

    for (let row of reducedData) {
      const { positions, group, transient, layer } = row;

      const parent = row[parentSymbol];

      if (parentData) {
        row.parent = parentData.row(row[parentSymbol].value());
      }

      row = recipe.mapfn(row);

      row.parent = parent;
      row.positions = positions;
      row.group = group;
      row.transient = transient;
      row.layer = layer;

      console.log(row);

      if (!row.parent) {
        mappedAndStackedData.push(row);
        continue;
      }

      const parentRow = parentData?.row(row[parentSymbol]);
      const stacked = recipe.stackfn(parentRow[stackSymbol], row);
      parentValue[stackSymbol] = stacked;
      Object.assign(row, stacked);

      mappedAndStackedData.push(row);
    }

    return mappedAndStackedData;
  };

  getParts = () => {
    const factor = this.factor();
    const { data, parent, recipe } = this;

    const indices = factor.indices();

    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentParts = parent?.parts?.() ?? {};
    for (const parentPart of values(parentParts)) {
      parentPart[stackSymbol] = recipe.stackinit();
    }

    const indexMap = new IndexMap(indices, parentFactor?.indices());
    const parts: Record<number, Record<string | symbol, Scalar>> = {};

    const row = SlidingRow.from(data, 0);

    // Iterate length of data (n): reduce
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];

      if (!(index in parts)) parts[index] = recipe.reduceinit();
      parts[index] = recipe.reducefn(parts[index], row.values());
      row.slide();
    }

    // Iterate parts: map and stack
    for (const index of keys(parts)) {
      let part = parts[index];
      const parentPart = parentParts?.[indexMap.parentIndex(index)];

      const label = factor.label(index);

      Object.assign(part, label, { parent: parentPart });
      part = recipe.mapfn(parts[index]);
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
      const stacked = recipe.stackfn(parentPart[stackSymbol], part);

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
