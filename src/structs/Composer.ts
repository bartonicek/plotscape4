import { POJO, identity, secondArgument } from "../utils/funs";
import { JustFn, MapFn, ReduceFn, Reducer } from "../utils/types";

const identityReducer = { reducefn: secondArgument, initialfn: POJO };

export class Composer<T, U, V = any, F = any> {
  constructor(
    public reducer: Reducer<T, U>,
    public mapper: MapFn<U & F, V>,
    public stacker: Reducer<V, V>,
    public state = { reduced: false, mapped: false, stacked: false }
  ) {}

  static default = <T, U, V, F>() => {
    return new Composer<T, U, V, F>(
      identityReducer as any,
      identity as any,
      identityReducer as any
    );
  };

  reduce = <U2>(reducefn: ReduceFn<T, U2>, initialfn: JustFn<U2>) => {
    const reducer = { reducefn, initialfn };
    return new Composer<T, U2, V, F>(
      reducer,
      this.mapper as unknown as MapFn<U2 & F, V>,
      this.stacker,
      { ...this.state, ...{ reduced: true } }
    );
  };

  map = <V2>(mapfn: MapFn<U & F, V2>) => {
    return new Composer<T, U, V2, F>(
      this.reducer,
      mapfn,
      this.stacker as unknown as Reducer<V2, V2>,
      { ...this.state, ...{ mapped: true } }
    );
  };

  stack = <V2 extends Partial<V>>(
    stackfn: ReduceFn<V2, V2>,
    initialfn: JustFn<V2>
  ) => {
    const stacker = { reducefn: stackfn, initialfn };
    return new Composer<T, U, V, F>(
      this.reducer,
      this.mapper,
      stacker as unknown as Reducer<V, V>,
      { ...this.state, ...{ stacked: true } }
    );
  };
}
