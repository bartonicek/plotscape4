import { values } from "../utils/funs";
import { Dict } from "../utils/types";

export class IterableObject {
  constructor(public values: Dict) {}
  static of = (values: Dict) => new IterableObject(values);

  *[Symbol.iterator]() {
    for (const value of values(this.values)) yield value;
  }
}
