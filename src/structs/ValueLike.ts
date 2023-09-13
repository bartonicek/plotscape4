import { Accessor } from "solid-js";

export type ValueLike<T> = { value: () => T };

export class Value<T> implements ValueLike<T> {
  constructor(public val: T) {}
  value = () => this.val;
}

export class View<T> implements ValueLike<T> {
  constructor(public array: T[], public index: number) {}
  value = () => this.array[this.index];
}

export class Signal<T> implements ValueLike<T> {
  constructor(public accessor: Accessor<T>) {}
  value = () => this.accessor();
}

export const val = <T>(value: T) => new Value(value);
export const view = <T>(array: T[], index: number) => new View(array, index);
export const sig = <T>(accessor: Accessor<T>) => new Signal(accessor);
