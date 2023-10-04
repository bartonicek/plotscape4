import { POJO, identity, secondArgument } from "../utils/funs";
import { Cols, ColsOf, Lazy, MapFn, ReduceFn, Row } from "../utils/types";

const initState = {
  reduced: false,
  mapped: false,
  stacked: false,
  relabeled: false,
};
type RecipeState = typeof initState;

export class Recipe<T extends Row, U extends Row, V extends Row> {
  constructor(
    public reducefn: ReduceFn<T, U>,
    public reduceinit: Lazy<U>,
    public mapfn: MapFn<U, V>,
    public stackfn: ReduceFn<V, V>,
    public stackinit: Lazy<V>,
    public relabelfn: MapFn<any, any>,
    public state: RecipeState
  ) {}

  static default = <T extends Row>() => {
    return new Recipe<T, Row, Row>(
      secondArgument,
      POJO,
      identity,
      secondArgument,
      POJO,
      identity,
      initState
    );
  };

  reduce = <U2 extends Row>(reducefn: ReduceFn<T, U2>, init: Lazy<U2>) => {
    this.reducefn = reducefn as any;
    this.reduceinit = init as any;
    this.state.reduced = true;
    return this as unknown as Recipe<T, U2, V>;
  };

  map = <V2 extends Row>(mapfn: MapFn<U, V2>) => {
    this.mapfn = mapfn as any;
    this.state.mapped = true;
    return this as unknown as Recipe<T, U, V2>;
  };

  stack = <V2 extends Row>(stacfkn: ReduceFn<V2, V2>, init: Lazy<V2>) => {
    this.stackfn = stacfkn as any;
    this.stackinit = init as any;
    this.state.stacked = true;
    return this as unknown as Recipe<T, U, V2>;
  };

  relabel = <W2 extends Cols>(relabelfn: MapFn<ColsOf<V>, W2>) => {
    this.relabelfn = relabelfn;
    this.state.relabeled = true;
    return this as unknown as Recipe<T, U, V>;
  };
}
