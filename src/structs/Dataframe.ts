import { allKeys, entries, lazy, unwrapAll } from "../utils/funs";
import { Cols, Key, MapFn, RowOf } from "../utils/types";
import {
  Discrete,
  Numeric,
  Reference,
  ScalarOf,
  Variable,
  VariableLike,
} from "./Variable";

const colConstructorMap = {
  numeric: Numeric,
  discrete: Discrete,
  reference: Reference,
};
type ColConstructorMap = typeof colConstructorMap;
type ColTypeMap = {
  [key in keyof ColConstructorMap]: InstanceType<ColConstructorMap[key]>;
};

export class Dataframe<T extends Cols> {
  meta: { n: number; keys: (string | symbol)[] };

  constructor(public cols: T) {
    const n = Object.values(cols)[0].meta.n;
    this.meta = { n, keys: Reflect.ownKeys(cols) };
  }

  static from = <T extends Cols>(cols: T) => {
    return new Dataframe(cols);
  };

  static fromRow = <T extends Cols>(row: RowOf<T>) => {
    const cols = {} as T;

    for (const k of allKeys(row)) {
      if (row[k]) cols[k] = row[k].toVariable() as any;
    }

    return Dataframe.from(cols);
  };

  static fromRows = <T extends Cols>(rows: RowOf<T>[]) => {
    const data = Dataframe.fromRow(rows[0]);
    for (let i = 1; i < rows.length; i++) data.push(rows[i]);
    return data;
  };

  static parseCols = <
    U extends Record<string, keyof ColTypeMap>,
    V extends Record<keyof U, any[]>
  >(
    unparsed: V,
    spec: U
  ) => {
    const cols = {} as { [key in keyof U]: ColTypeMap[U[key]] };

    for (const [k, v] of entries(spec)) {
      cols[k] = new colConstructorMap[v](unparsed[k]) as ColTypeMap[typeof v];
    }

    return Dataframe.from(cols);
  };

  appendCol = <K extends string | symbol, V extends VariableLike<any>>(
    key: K,
    variable: V
  ) => {
    this.cols[key] = variable as any;
    this.meta.keys.push(key);
    return this;
  };

  push = (row: RowOf<T>) => {
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

  select = <U extends Record<Key, Variable>>(selectfn: MapFn<T, U>) => {
    const cols = selectfn(this.cols);
    return new Dataframe(cols);
  };

  col = (key: keyof T) => this.cols[key];

  cell = (key: keyof T, index: number) => {
    return this.cols[key].ith(lazy(index));
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
