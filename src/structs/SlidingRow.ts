import { values } from "../utils/funs";
import { JustFn, Row } from "../utils/types";

export class SlidingRow<T extends Row> {
  indexfn: JustFn<number>;
  constructor(public vals: T, public index: number) {
    this.indexfn = () => this.index;
    for (const val of values(vals)) val.setIndexFn(this.indexfn);
  }

  static of = <T extends Row>(vals: T, index: number) => {
    return new SlidingRow(vals, index);
  };

  values = () => this.vals;
  slide = () => this.index++;
}
