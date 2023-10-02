import { Lazy } from "../utils/types";
import { ValueLike, val } from "./ValueLike";
import { Discrete, Numeric, Reference } from "./Variable";

export const num = (x: number) => new Num(val(x));
export const dis = (x: string) => new Dis(val(x));
export const ref = (x: any) => new Ref(val(x));

// export type ScalarLike<T> = {
//   value: () => T;
//   toVariable: () => any;
//   setIndexFn: (indexfn: Lazy<number>) => void;
// };

export class Num {
  constructor(private valueLike: ValueLike<number>) {}

  value = () => this.valueLike.value();
  toVariable = () => new Numeric([this.value()]);
  setIndexFn = (indexfn: Lazy<number>) => {
    this.valueLike.setIndexFn?.(indexfn);
  };

  inc = () => num(this.value() + 1);
  dec = () => num(this.value() - 1);

  incWith = (amount: number) => num(this.value() + amount);
  decWith = (amount: number) => num(this.value() - amount);
  multWith = (amount: number) => num(this.value() * amount);

  add = (other: Num) => num(this.value() + other.value());
  subtract = (other: Num) => num(this.value() - other.value());
  times = (other: Num) => num(this.value() * other.value());
  divideBy = (other: Num) => num(this.value() / other.value());
}

export class Dis {
  constructor(private valueLike: ValueLike<string>) {}

  value = () => this.valueLike.value();
  toVariable = () => new Discrete([this.value()]);
  setIndexFn = (indexfn: Lazy<number>) => {
    this.valueLike.setIndexFn?.(indexfn);
  };

  paste = (other: Dis) => dis(this.value() + other.value());
}

export class Ref {
  constructor(private valueLike: ValueLike<any>) {}

  value = () => this.valueLike.value();
  toVariable = () => new Reference([this.value()]);
  setIndexFn = (indexfn: Lazy<number>) => {
    this.valueLike.setIndexFn?.(indexfn);
  };
}
