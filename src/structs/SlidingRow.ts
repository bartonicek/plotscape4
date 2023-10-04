import { values } from "../utils/funs";
import { Cols, Lazy, RowOf } from "../utils/types";
import { Dataframe } from "./Dataframe";

export class SlidingRow<T extends Cols> {
  row: RowOf<T>;
  indexfn: Lazy<number>;

  constructor(public data: Dataframe<T>, public index: number) {
    this.row = data.row(index);
    this.indexfn = () => this.index;

    for (const val of values(this.row)) val.setIndexFn?.(this.indexfn);
  }

  static from = <T extends Cols>(data: Dataframe<T>, index: number) => {
    return new SlidingRow(data, index);
  };

  values = () => this.row;
  slide = () => this.index++;
}
