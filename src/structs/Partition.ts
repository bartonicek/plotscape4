import { Accessor, createMemo, untrack } from "solid-js";
import { diff, values } from "../utils/funs";
import { Cols, Row, RowOf, Scalar } from "../utils/types";
import { Dataframe } from "./Dataframe";
import { Factor, FactorProduct } from "./Factor";
import { Recipe } from "./Recipe";
import { ref } from "./Scalar";
import { SlidingRow } from "./SlidingRow";

const symbolProps = ["parent", "positions", "layer", "group", "transient"].map(
  Symbol.for
);

const [
  parentSymbol,
  positionsSymbol,
  layerSymbol,
  groupSymbol,
  transientSymbol,
] = symbolProps;

// Declared separately since we dont want to copy this
// but append to parent
const stackSymbol = Symbol.for("stack");

export class Partition<T extends Cols> {
  reduced: Accessor<Dataframe<Cols>>;
  mappedStacked: Accessor<Dataframe<Cols>>;
  rowIndexMap: Record<number, number>;

  constructor(
    public factor: Accessor<Factor>,
    public data: Dataframe<T>,
    public recipe: Recipe<RowOf<T>, any, any>,
    public parent?: Partition<T>
  ) {
    this.reduced = createMemo(() => this.reduce());
    this.mappedStacked = createMemo(() => this.mapStack());
    this.rowIndexMap = {};
  }

  update = () => {
    this.reduced = createMemo(() => this.reduce());
    this.mappedStacked = createMemo(() => this.mapStack());
    return this;
  };

  nest = (childFactor: Accessor<Factor>, recipe?: Recipe<any, any, any>) => {
    const { data, factor } = this;
    recipe = recipe ?? this.recipe;

    const product = () => FactorProduct.from(factor(), childFactor());
    const childPartition = new Partition(product, data, recipe, this);
    return childPartition;
  };

  reduce = (): Dataframe<Cols> => {
    const { data, parent, recipe } = this;

    const factor = this.factor();
    const indices = factor.indices();
    const uniqueIndices = Array.from(factor.uniqueIndices()).sort(diff);
    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentIndices = parentFactor?.indices();
    const parentUniqueIndices = Array.from(parentFactor?.uniqueIndices() ?? []);

    if (!recipe.state.reduced) {
      return this.data as Dataframe<Cols>;
    }

    const reducedParts: Record<number, Record<string | symbol, Scalar>> = {};
    const dataRow = SlidingRow.from(data, 0);
    const parentRowIndexMap: Record<number, number> = {};

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      if (!(index in reducedParts)) {
        reducedParts[index] = recipe.reduceinit();
        const parentIndex = parentIndices?.[i] ?? 0;
        parentRowIndexMap[index] = parentUniqueIndices.indexOf(parentIndex);
      }

      const values = dataRow.values();
      reducedParts[index] = recipe.reducefn(reducedParts[index], values);
      dataRow.slide();
    }

    const row1 = values(reducedParts)[0];
    for (const s of symbolProps) row1[s] = ref(undefined);
    Object.assign(row1, factor.label(indices[0]));

    const reducedData = Dataframe.fromRow(row1).empty();

    for (const index of uniqueIndices) {
      const positions = factor.positions(index);
      reducedParts[index][positionsSymbol] = ref(positions);
      reducedParts[index][parentSymbol] = ref(parentRowIndexMap[index]);

      Object.assign(reducedParts[index], factor.label(index));
      reducedData.push(reducedParts[index]);
    }

    return reducedData;
  };

  mapStack = () => {
    const { recipe, parent } = this;
    const reduced = this.reduced();

    if (!parent) return Dataframe.fromRow(recipe.mapfn(reduced.row(0)));
    const parentRows = parent.mappedStacked().rows();

    const row1 = reduced.row(0) as RowOf<T> & { parent: Row };
    row1.parent = parentRows[row1[parentSymbol].value()];

    const mappedRow1 = recipe.mapfn(row1);
    const mappedStacked = Dataframe.fromRow(mappedRow1).empty();

    for (const row of reduced) {
      const parentRowIndex = row[parentSymbol].value();
      const parentRow = parentRows[parentRowIndex];
      row.parent = parentRow as any;
      const mappedRow = recipe.mapfn(row);

      if (!recipe.state.stacked) {
        mappedStacked.push(mappedRow);
        continue;
      }

      if (!parentRow[stackSymbol]) {
        parentRow[stackSymbol] = recipe.stackinit();
      }

      const stackedRow = recipe.stackfn(parentRow[stackSymbol], mappedRow);
      parentRows[parentRowIndex][stackSymbol] = stackedRow;

      Object.assign(mappedRow, stackedRow);
      mappedStacked.push(mappedRow);
    }

    // Copy over columns from reduced dataset
    for (const s of symbolProps) mappedStacked.appendCol(s, reduced.col(s));

    return mappedStacked;
  };
}
