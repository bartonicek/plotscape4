import { Accessor, Setter, createSignal } from "solid-js";
import { isFunction } from "../utils/guards";
import { Flatten, MapFn } from "../utils/types";

export type Getters = { [key: string]: Accessor<any> };
export type Setters = { [key: string]: Setter<any> };

export class SignalStore<T extends Getters, U extends Setters> {
  constructor(public getters: T, public setters: U) {}
  static default = () => new SignalStore({}, {});

  bind = <K extends string, V extends any>(key: K, value: V | MapFn<T, V>) => {
    // Have to type assert in return anyway
    const getters = this.getters as any;
    const setters = this.setters as any;

    if (isFunction(value)) {
      const getter = () => value(this.getters);
      getters[key] = getter;
    } else {
      const [getter, setter] = createSignal(value);
      getters[key] = getter;
      setters[key] = setter;
    }

    return new SignalStore(
      getters as Flatten<T & { [key in K]: Accessor<V> }>,
      setters as V extends Function ? Flatten<U & { [key in K]: Setter<V> }> : U
    );
  };

  get = (key: keyof T) => this.getters[key]();
  set = <K extends keyof U>(key: K, value: Parameters<U[K]>[0]) => {
    this.setters[key](value);
  };
}
