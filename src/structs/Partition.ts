import { Accessor, createMemo, untrack } from "solid-js";
import { diff, values } from "../utils/funs";
import { Cols, Row, RowOf, Scalar } from "../utils/types";
import { Dataframe } from "./Dataframe";
import { Factor, FactorProduct } from "./Factor";
import { Recipe } from "./Recipe";
import { ref } from "./Scalar";
import { SlidingRow } from "./SlidingRow";

const symbolProps = ["parent", "positions"];

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
    if (!recipe.state.reduced) return this.data as unknown as Dataframe<Cols>;

    const factor = this.factor();
    const indices = factor.indices();
    const uniqueIndices = Array.from(factor.uniqueIndices()).sort(diff);
    const parentFactor = parent ? untrack(parent.factor) : undefined;
    const parentIndices = parentFactor?.indices();
    const parentUniqueIndices = Array.from(parentFactor?.uniqueIndices() ?? []);

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
    for (const s of symbolProps) row1[Symbol.for(s)] = ref(undefined);
    Object.assign(row1, factor.label(factor.indices()[0]));

    const reducedData = Dataframe.fromRow(row1).empty();

    for (const index of uniqueIndices) {
      const positions = factor.positions(index);
      reducedParts[index][Symbol.for("positions")] = ref(positions);
      reducedParts[index][Symbol.for("parent")] = ref(parentRowIndexMap[index]);
      Object.assign(reducedParts[index], factor.label(index));
      reducedData.push(reducedParts[index], index);
    }

    return reducedData;
  };

  mapStack = () => {
    const { recipe, parent } = this;
    const reduced = this.reduce() as Dataframe<T & { parent: Row }>;

    const [parentSymbol, stackSymbol, positionsSymbol] = [
      "parent",
      "stack",
      "positions",
    ].map(Symbol.for);

    if (!parent) return Dataframe.fromRow(recipe.mapfn(reduced.row(0)));
    const parentRows = parent.mapStack().rows();

    const row1 = reduced.row(0) as RowOf<T> & { parent: Row };
    row1.parent = parentRows[row1[parentSymbol].value()];

    const mappedRow1 = recipe.mapfn(row1);
    for (const k of ["layer", "group", "transient"]) mappedRow1[k] = row1[k];
    for (const s of symbolProps) mappedRow1[Symbol.for(s)] = ref(undefined);

    const mappedStacked = Dataframe.fromRow(mappedRow1).empty();

    for (const row of reduced) {
      const parentRowIndex = row[parentSymbol].value();
      const parentRow = parentRows[parentRowIndex];
      row.parent = parentRow as any;
      const mappedRow = recipe.mapfn(row);
      mappedRow[positionsSymbol] = row[positionsSymbol];
      mappedRow[parentSymbol] = row[parentSymbol];

      for (const k of ["layer", "group", "transient"]) mappedRow[k] = row[k];

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

    return mappedStacked;
  };
}
