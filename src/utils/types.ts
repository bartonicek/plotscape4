import { Dis, Num, Ref } from "../structs/Scalar";
import { Discrete, Numeric, Reference, Variable } from "../structs/Variable";

export type Fn = (...args: any[]) => any;
export type JustFn<T> = () => T;
export type ReduceFn<T, U> = (prev: U, next: T) => U;
export type MapFn<T, U> = (next: T) => U;

export type Reducer<T, U> = { reducefn: ReduceFn<T, U>; initialfn: JustFn<U> };

export type Dict = Record<string, any>;
export type DropNever<T extends Dict> = {
  [key in keyof T as T[key] extends never ? never : key]: T[key];
};

export type Scalar = Num | Dis | Ref;
export type Row = Record<string | symbol, Scalar>;
export type Cols = Record<string | symbol, Variable>;

export type ValueOf<T extends Scalar> = T extends Num
  ? number
  : T extends Dis
  ? string
  : T extends Ref
  ? object
  : never;

export type ScalarOf<T> = T extends Numeric
  ? Num
  : T extends Discrete
  ? Dis
  : T extends Reference
  ? Ref
  : never;

export type VariableOf<T> = T extends Num
  ? Numeric
  : T extends Dis
  ? Discrete
  : T extends Ref
  ? Reference
  : never;

export type RowOf<T extends Cols> = { [key in keyof T]: ScalarOf<T[key]> };
export type ColsOf<T extends Row> = { [key in keyof T]: VariableOf<T[key]> };
