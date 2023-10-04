import { minMaxSum } from "../utils/funs";
import { Lazy, Scalar } from "../utils/types";
import { FactorBinned, FactorDiscrete } from "./Factor";
import { Dis, Num, Ref } from "./Scalar";
import { ValueLike, view } from "./ValueLike";

export type VariableLike<T extends Scalar> = {
  ith: (indexfn: Lazy<number>) => T;
  push: (scalar: T) => number;
  empty: () => void;
};

export type Variable = Numeric | Discrete | Reference;
export type ScalarOf<T extends Variable> = T extends Numeric
  ? Num
  : T extends Discrete
  ? Dis
  : T extends Reference
  ? Ref
  : never;

export class Numeric implements VariableLike<Num> {
  meta: { n: number; min: number; max: number; sum: number };

  constructor(public array: number[]) {
    const [min, max, sum] = minMaxSum(array);
    this.meta = { n: array.length, min, max, sum };
  }

  static default = () => new Numeric([]);
  static from = (array: number[]) => new Numeric(array);

  ith = (indexfn: Lazy<number>) => new Num(view(this.array, indexfn));
  push = (scalar: Num) => {
    const value = scalar.value();

    this.meta.min = Math.min(this.meta.min, value);
    this.meta.max = Math.max(this.meta.max, value);
    this.meta.sum += value;
    this.meta.n++;

    return this.array.push(value);
  };

  bin = (width?: ValueLike<number>, anchor?: ValueLike<number>) => {
    return FactorBinned.from(this.array, width?.value(), anchor?.value());
  };

  empty = () => {
    this.array.length = 0;
    this.meta.n = 0;
    this.meta.min = Infinity;
    this.meta.max = -Infinity;
    this.meta.sum = 0;
    return this;
  };
}

export class Discrete implements VariableLike<Dis> {
  meta: { n: number; values: Set<string> };

  constructor(public array: string[]) {
    this.meta = { n: array.length, values: new Set(array) };
  }

  static default = () => new Numeric([]);
  static from = (array: string[]) => new Discrete(array);

  factor = () => FactorDiscrete.from(this.array);

  ith = (indexfn: Lazy<number>) => new Dis(view(this.array, indexfn));
  push = (scalar: Dis) => {
    const value = scalar.value();

    this.meta.values.add(value);
    this.meta.n++;

    return this.array.push(value);
  };

  empty = () => {
    this.array.length = 0;
    this.meta.n = 0;
    this.meta.values = new Set<string>();
  };
}

export class Reference implements VariableLike<Ref> {
  meta: { n: number };

  constructor(public array: object[]) {
    this.meta = { n: array.length };
  }

  static default = () => new Reference([]);
  static from = (array: object[]) => new Reference(array);

  ith = (indexfn: Lazy<number>) => new Ref(view(this.array, indexfn));
  push = (scalar: Ref) => {
    const value = scalar.value();

    this.meta.n++;
    return this.array.push(value);
  };

  empty = () => {
    this.array.length = 0;
    this.meta.n = 0;
  };
}
