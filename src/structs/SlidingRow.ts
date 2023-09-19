import { entries } from "../utils/funs";
import { Cols, RowOf } from "../utils/types";

export class SlidingRow<T extends Cols> {
  values: RowOf<T>;

  constructor(public cols: T, public index: number) {
    this.values = {} as RowOf<T>;
    const indexfn = () => this.index;
    for (const [k, v] of entries(cols)) this.values[k] = v.ith(indexfn) as any;
  }

  slide = () => {
    this.index++;
  };
}
