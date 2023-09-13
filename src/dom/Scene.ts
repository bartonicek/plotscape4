import { Dataframe } from "../structs/Dataframe";
import { Cols } from "../utils/types";
import Marker from "../wrangling/Marker";

export class Scene<T extends Cols> {
  marker: Marker;

  constructor(public data: Dataframe<T>) {
    this.marker = new Marker(
      () => data.meta.n,
      () => [],
      () => 1
    );
  }
}
