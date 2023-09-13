import { ValueLike, val } from "../structs/ValueLike";

export class Expanse {
  constructor(
    public lower: ValueLike<number>,
    public upper: ValueLike<number>
  ) {}

  static default = () => new Expanse(val(0), val(1));

  range = () => this.upper.value() - this.lower.value();
  normalize = (x: number) => (x - this.lower.value()) / this.range();
  unnormalize = (pct: number) => pct * this.range() + this.lower.value();
}
