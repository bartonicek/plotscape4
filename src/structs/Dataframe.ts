import { entries, unwrapAll } from "../utils/funs";
import { Cols, Dict, RowOf } from "../utils/types";
import { Discrete, Numeric, ScalarOf } from "./Variable";

export class Dataframe<T extends Cols> {
  meta: Dict;

  constructor(public cols: T) {
    this.meta = { n: Object.values(cols)[0].meta.n };
  }

  static from = <T extends Cols>(cols: T) => new Dataframe(cols);
  static fromRow = <T extends Cols>(row: RowOf<T>) => {
    const cols = {} as T;
    for (const [k, v] of entries(row)) if (v) cols[k] = v.toVariable() as any;
    return Dataframe.from(cols);
  };
  static parseCols = <
    U extends Record<string, "numeric" | "discrete">,
    V extends Record<keyof U, any[]>
  >(
    unparsed: V,
    spec: U
  ) => {
    const cols = {} as {
      [key in keyof typeof spec]: U[key] extends "numeric"
        ? Numeric
        : U[key] extends "discrete"
        ? Discrete
        : never;
    };

    for (const [k, v] of entries(spec)) {
      cols[k] =
        v === "numeric"
          ? new Numeric(unparsed[k as keyof V])
          : (new Discrete(unparsed[k as keyof V]) as any);
    }
    return Dataframe.from(cols);
  };

  push = (row: RowOf<T>) => {
    for (const [k, v] of entries(row)) this.cols[k].push(v as any);
    return ++this.meta.n;
  };

  select = <U extends Record<string, keyof T>>(keyMap: U) => {
    const cols = {} as { [key in keyof U]: T[U[key]] };
    for (const [k1, k2] of entries(keyMap)) cols[k1] = this.cols[k2];
    return new Dataframe(cols);
  };

  row = (index: number) => {
    const row = {} as Record<string, any>;
    for (const [k, v] of entries(this.cols)) {
      row[k as string] = v.ith(() => index);
    }
    return row as { [key in keyof T]: ScalarOf<T[key]> };
  };

  unwrapRow = (index: number) => unwrapAll(this.row(index));
  unwrapRows = () => {
    const result = [];
    for (let i = 0; i < this.meta.n; i++) result.push(this.unwrapRow(i));
    return result;
  };

  *[Symbol.iterator]() {
    for (let i = 0; i < this.meta.n; i++) yield this.row(i);
  }
}
