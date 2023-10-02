import { allKeys, entries, lazy, unwrapAll } from "../utils/funs";
import { Cols, RowOf } from "../utils/types";
import { Discrete, Numeric, ScalarOf } from "./Variable";

export class Dataframe<T extends Cols> {
  meta: { n: number; keys: (string | symbol)[] };
  rowIds: Record<number, number>;

  constructor(public cols: T, rowIds?: Record<number, number>) {
    const n = Object.values(cols)[0].meta.n;
    this.meta = { n, keys: Reflect.ownKeys(cols) };
    this.rowIds = rowIds ?? {};
    if (!rowIds) for (let i = 0; i < n; i++) this.rowIds[i] = i;
  }

  static from = <T extends Cols>(cols: T, rowIds?: Record<number, number>) => {
    return new Dataframe(cols, rowIds);
  };

  static fromRow = <T extends Cols>(row: RowOf<T>, id?: number) => {
    const cols = {} as T;

    for (const k of allKeys(row)) {
      if (row[k]) cols[k] = row[k].toVariable() as any;
    }

    return Dataframe.from(cols, { [id ?? 0]: 0 });
  };

  static fromRows = <T extends Cols>(rows: RowOf<T>[]) => {
    const data = Dataframe.fromRow(rows[0]);
    for (let i = 1; i < rows.length; i++) data.push(rows[i]);
    return data;
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

  push = (row: RowOf<T>, id?: number) => {
    this.rowIds[id ?? this.meta.n] = this.meta.n;
    for (const k of allKeys(row)) {
      if (this.cols[k]) this.cols[k].push(row[k] as any);
    }
    return ++this.meta.n;
  };

  empty = () => {
    for (const k of this.meta.keys) this.cols[k].empty();
    this.meta.n = 0;
    return this;
  };

  select = <U extends Record<string, keyof T>>(keyMap: U) => {
    const cols = {} as { [key in keyof U]: T[U[key]] };
    for (const [k1, k2] of entries(keyMap)) cols[k1] = this.cols[k2];
    return new Dataframe(cols);
  };

  row = (index: number) => {
    const row = {} as Record<string, any>;
    const { keys } = this.meta as { keys: any[] };
    for (const k of keys) row[k] = this.cols[k].ith(lazy(index));
    return row as { [key in keyof T]: ScalarOf<T[key]> };
  };

  rows = () => {
    const result = [];
    for (const row of this) result.push(row);
    return result;
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
