import { Dis, Num, Ref } from "../structs/Scalar";
import { Discrete, Numeric, Reference, Variable } from "../structs/Variable";

export type Key = number | string | symbol;
export type Primitive = number | string | boolean | symbol | Function;
export type Flatten<T> = T extends Primitive
  ? T
  : { [key in keyof T]: Flatten<T[key]> };
export type Lazy<T> = () => T;

export type Fn = (...args: any[]) => any;
export type ReduceFn<T, U> = (prev: U, next: T) => U;
export type MapFn<T, U> = (next: T) => U;

export type Reducer<T, U> = { reducefn: ReduceFn<T, U>; initialfn: Lazy<U> };

export type Dict = Record<Key, any>;

export type KeysOfType<T extends Record<Key, any>, U> = keyof {
  [key in keyof T as T[key] extends U ? key : never]: U;
};

export type DropNever<T extends Dict> = {
  [key in keyof T as T[key] extends never ? never : key]: T[key];
};

export type Scalar = Num | Dis | Ref;
export type Row = Record<Key, Scalar>;
export type Cols = Record<Key, Variable>;

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
