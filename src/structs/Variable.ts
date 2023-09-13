import { minMaxSum } from "../utils/funts";
import { FactorBinned, FactorDiscrete } from "./Factor";
import { Dis, Num, Ref } from "./Scalar";
import { ValueLike, view } from "./ValueLike";

export type ScalarOf<T extends Variable> = T extends Numeric ? Num : Dis;
export type Variable = Numeric | Discrete | Reference;

export class Numeric {
  meta: { n: number; min: number; max: number; sum: number };

  constructor(public array: number[]) {
    const [min, max, sum] = minMaxSum(array);
    this.meta = { n: array.length, min, max, sum };
  }

  static default = () => new Numeric([]);
  static from = (array: number[]) => new Numeric(array);

  bin = (width?: ValueLike<number>, anchor?: ValueLike<number>) => {
    return FactorBinned.from(this.array, width?.value(), anchor?.value());
  };

  ith = (index: number) => new Num(view(this.array, index));
  push = (scalar: Num) => {
    const value = scalar.value();

    this.meta.min = Math.min(this.meta.min, value);
    this.meta.max = Math.max(this.meta.max, value);
    this.meta.sum += value;
    this.meta.n++;

    return this.array.push(value);
  };
}

export class Discrete {
  meta: { n: number; values: Set<string> };

  constructor(public array: string[]) {
    this.meta = { n: array.length, values: new Set(array) };
  }

  static default = () => new Numeric([]);
  static from = (array: number[]) => new Numeric(array);

  factor = () => FactorDiscrete.from(this.array);

  ith = (index: number) => new Dis(view(this.array, index));
  push = (scalar: Dis) => {
    const value = scalar.value();

    this.meta.values.add(value);
    this.meta.n++;

    return this.array.push(value);
  };
}

export class Reference {
  meta: { n: number };

  constructor(public array: object[]) {
    this.meta = { n: array.length };
  }

  static default = () => new Reference([]);
  static from = (array: object[]) => new Reference(array);

  ith = (index: number) => new Ref(view(this.array, index));
  push = (scalar: Ref) => {
    const value = scalar.value();

    this.meta.n++;
    return this.array.push(value);
  };
}
