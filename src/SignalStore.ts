import { Accessor, Setter, createSignal } from "solid-js";
import { Factor } from "./structs/Factor";
import { Variable } from "./structs/Variable";
import { entries } from "./utils/funts";
import { DropNever, Fn, Scalar } from "./utils/types";

export type Getters = { [key: string]: Accessor<any> };
export type Setters = { [key: string]: Setter<any> };

export class SignalStore<T extends Getters, U extends Setters> {
  constructor(public getters: T, public setters: U) {}

  static default = () => new SignalStore({}, {});

  bind = <
    V extends { [key: string]: Scalar | Variable | ((getters: T) => any) }
  >(
    bindObj: V
  ) => {
    const getters = this.getters as Getters;
    const setters = this.setters as Setters;

    for (const [k, v] of entries(bindObj)) {
      const key = k as string;
      if (typeof v === "function") {
        getters[key] = () => v(getters as T);
      } else {
        const [getter, setter] = createSignal(v);
        getters[key] = getter;
        setters[key] = setter;
      }
    }

    return new SignalStore(
      getters as T & {
        [key in keyof V]: V[key] extends Fn
          ? Accessor<ReturnType<V[key]>>
          : Accessor<V[key]>;
      },
      setters as U &
        DropNever<{
          [key in keyof V]: V[key] extends Scalar ? Setter<V[key]> : never;
        }>
    );
  };

  extract = (extractfn: (getters: T) => Accessor<Factor>[]) => {
    return extractfn(this.getters);
  };
}
