import {
  Accessor,
  Setter,
  createEffect,
  createSignal,
  untrack,
} from "solid-js";
import { Factor, FactorDiscrete } from "../structs/Factor";
import { ref } from "../structs/Scalar";

export const Group = {
  Group1T: 4,
  Group2T: 3,
  Group3T: 2,
  Group4T: 1,
  Group1: 132,
  Group2: 131,
  Group3: 130,
  Group4: 129,
} as const;

export const GroupLabels = {
  4: { group: ref(1), layer: ref(4), transient: ref(true) },
  3: { group: ref(2), layer: ref(3), transient: ref(true) },
  2: { group: ref(3), layer: ref(2), transient: ref(true) },
  1: { group: ref(4), layer: ref(1), transient: ref(true) },
  132: { group: ref(1), layer: ref(132), transient: ref(false) },
  131: { group: ref(2), layer: ref(131), transient: ref(false) },
  130: { group: ref(3), layer: ref(130), transient: ref(false) },
  129: { group: ref(4), layer: ref(129), transient: ref(false) },
} as const;

export const groups = [4, 3, 2, 1, 132, 131, 130, 129] as const;
export const transientGroups = [4, 3, 2, 1] as const;

const uniqueIndices = new Set(groups);
const positions = {
  4: new Set<number>(),
  3: new Set<number>(),
  2: new Set<number>(),
  1: new Set<number>(),
  132: new Set<number>(),
  131: new Set<number>(),
  130: new Set<number>(),
  129: new Set<number>(),
};

const transient = (x: number) => x & ~128;
const removeTransient = (x: number) => x | 128;

export default class Marker {
  indices: Accessor<number[]>;
  setIndices: Setter<number[]>;
  factor: Accessor<Factor>;

  transientPositions: Set<number>;
  positions: Record<number, Set<number>>;

  constructor(
    public n: Accessor<number>,
    public cases: Accessor<number[]>,
    public group: Accessor<number>
  ) {
    const [indices, setIndices] = createSignal(
      Array(this.n()).fill(Group.Group1)
    );
    this.indices = indices;
    this.setIndices = setIndices;

    this.transientPositions = new Set();
    this.positions = positions;
    this.positions[Group.Group1] = new Set(Array.from(Array(n()), (_, i) => i));

    this.cases = cases;
    this.group = group;
    this.factor = () => {
      return new FactorDiscrete(
        uniqueIndices,
        indices(),
        positions,
        GroupLabels,
        {}
      );
    };

    createEffect(() => {
      const { positions, transientPositions } = this;
      const [cases, group] = [this.cases(), untrack(this.group)];
      const indices = [...untrack(this.indices)];

      if (!cases.length) return;

      for (const group of groups) {
        for (const i of cases) positions[group].delete(i);
      }

      if (group === 128) {
        transientPositions.clear();

        for (const i of cases) {
          const index = transient(indices[i]);
          indices[i] = index;
          positions[index].add(i);
          transientPositions.add(i);
        }
      } else {
        for (const i of cases) {
          indices[i] = group;
          positions[group].add(i);
        }
      }

      this.setIndices(indices);
    });
  }

  clearAll = () => {
    const n = untrack(this.n);
    for (const group of groups) this.positions[group].clear();
    for (let i = 0; i < n; i++) this.positions[Group.Group1].add(i);
    this.setIndices(Array(this.n()).fill(Group.Group1));
  };

  clearTransient = () => {
    const { positions: indexPositions, transientPositions: transientCases } =
      this;
    const indexArray = [...untrack(this.indices)];

    for (const group of transientGroups) indexPositions[group].clear();

    for (const i of transientCases) {
      indexArray[i] = removeTransient(indexArray[i]);
      indexPositions[Group.Group1].add(i);
    }

    this.setIndices(indexArray);
  };
}
