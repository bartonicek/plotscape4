import { Accessor } from "solid-js";
import { Lazy } from "../utils/types";

export type ValueLike<T> = {
  value: () => T;
  setIndexFn?: (indexfn: Lazy<number>) => void;
};

export class Value<T> implements ValueLike<T> {
  constructor(public val: T) {}
  value = () => this.val;
}

export class View<T> implements ValueLike<T> {
  constructor(public array: T[], public indexfn: Lazy<number>) {}
  value = () => this.array[this.indexfn()];
  setIndexFn = (indexfn: Lazy<number>) => {
    this.indexfn = indexfn;
  };
}

export class Signal<T> implements ValueLike<T> {
  constructor(public accessor: Accessor<T>) {}
  value = () => this.accessor();
}

export const val = <T>(value: T) => new Value(value);
export const sig = <T>(accessor: Accessor<T>) => new Signal(accessor);
export const view = <T>(array: T[], indexfn: Lazy<number>) => {
  return new View(array, indexfn);
};
