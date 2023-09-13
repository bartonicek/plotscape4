import { POJO, identity, secondArgument } from "../utils/funs";
import { Dict, JustFn, MapFn, ReduceFn, Reducer } from "../utils/types";

const identityReducer = { reducefn: secondArgument, initialfn: POJO };

// T = Row of data
// U = Factor labels
// V = Reduced data
// W = Mapped and Stacked data

export class Composer<T, U, V = any, W = any> {
  constructor(
    public reducer: Reducer<T, V>,
    public mapper: MapFn<V & U, W>,
    public stacker: Reducer<W, W>
  ) {}

  static default = <T extends Dict, U extends Dict>() => {
    return new Composer<T, U>(identityReducer, identity, identityReducer);
  };

  reduce = <V2>(reducefn: ReduceFn<T, V2>, initialfn: JustFn<V2>) => {
    const reducer = { reducefn, initialfn };
    return new Composer<T, U, V2, W>(
      reducer,
      this.mapper as unknown as MapFn<V2, W>,
      this.stacker
    );
  };

  map = <W2>(mapfn: MapFn<V & U, W2>) => {
    return new Composer<T, U, V, W2>(
      this.reducer,
      mapfn,
      this.stacker as unknown as Reducer<W2, W2>
    );
  };

  stack = <W2 extends Partial<W>>(
    stackfn: ReduceFn<W2, W2>,
    initialfn: JustFn<W2>
  ) => {
    const stacker = { reducefn: stackfn, initialfn };
    return new Composer<T, U, V, W2>(
      this.reducer,
      this.mapper as unknown as MapFn<V, W2>,
      stacker
    );
  };
}
