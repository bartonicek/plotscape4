import { disjointUnion, minMax } from "../utils/funs";
import { Dis, Num, dis, num } from "./Scalar";

export type Factor = {
  uniqueIndices: () => Set<number>;
  indices: () => number[];
  index: (position: number) => number;
  positions: (index: number) => Set<number>;
  label: (index: number) => Record<string, any>;
  meta: () => Record<string, any>;
};

export class FactorMono implements Factor {
  private _indices: number[];
  private _positions: Set<number>;

  constructor(n: number) {
    this._indices = Array(n).fill(0);
    this._positions = new Set(Array.from(Array(n), (_, i) => i));
  }
  static of = (n: number) => new FactorMono(n);

  uniqueIndices = () => new Set([0]);
  indices = () => this._indices;
  index = () => 0;
  positions = (index: number) =>
    index === 0 ? this._positions : new Set<number>();
  label = () => ({});
  meta = () => ({});
}

export class FactorIso implements Factor {
  private _uniqueIndices: Set<number>;
  private _indices: number[];

  constructor(n: number) {
    const arr = Array.from(Array(n), (_, i) => i);
    this._indices = arr;
    this._uniqueIndices = new Set(arr);
  }
  static of = (n: number) => new FactorIso(n);

  uniqueIndices = () => this._uniqueIndices;
  indices = () => this._indices;
  index = (position: number) => position;
  positions = (index: number) => new Set([index]);
  label = () => ({});
  meta = () => ({});
}

export class FactorDiscrete implements Factor {
  constructor(
    private _uniqueIndices: Set<number>,
    private _indices: number[],
    private _positions: Record<number, Set<number>>,
    private _labels: Record<number, Record<string, any>>,
    private _meta: { labels?: Record<string, any> }
  ) {}

  uniqueIndices = () => this._uniqueIndices;
  indices = () => this._indices;
  index = (position: number) => this._indices[position];
  positions = (index: number) => this._positions[index];
  label = (index: number) => this._labels[index];
  meta = () => this._meta;

  static from = (x: string[], labs?: string[]) => {
    labs = labs ?? Array.from(new Set(x)).sort();

    const uniqueIndices = new Set<number>();
    const indices: number[] = [];
    const positions = {} as Record<number, Set<number>>;
    const labels = {} as Record<number, { label: Dis }>;

    for (let i = 0; i < x.length; i++) {
      const index = labs.indexOf(x[i]);

      uniqueIndices.add(index);
      indices.push(index);

      if (!(index in positions)) positions[index] = new Set();
      if (!(index in labels)) labels[index] = { label: dis(x[i]) };

      positions[index].add(i);
    }

    const meta = { labels: labs };

    return new FactorDiscrete(uniqueIndices, indices, positions, labels, meta);
  };
}

export class FactorBinned implements Factor {
  constructor(
    private _uniqueIndices: Set<number>,
    private _indices: number[],
    private _positions: Record<number, Set<number>>,
    private _labels: Record<number, { binMin: Num; binMax: Num }>,
    private _meta: { breaks: number[] }
  ) {}

  uniqueIndices = () => this._uniqueIndices;
  indices = () => this._indices;
  index = (position: number) => this._indices[position];
  positions = (index: number) => this._positions[index];
  label = (index: number) => this._labels[index];
  meta = () => this._meta;

  static from = (values: number[], width?: number, anchor?: number) => {
    const [min, max] = minMax(values);
    const nbins = width ? Math.ceil((max - min) / width) + 1 : 10;
    width = width ?? (max - min) / (nbins - 1);
    anchor = anchor ?? min;

    const breakMin = min - width + ((anchor - min) % width);
    const breakMax = max + width - ((max - anchor) % width);

    const breaks = Array(nbins + 2);
    breaks[0] = breakMin;
    breaks[breaks.length - 1] = breakMax;

    for (let i = 1; i < breaks.length - 1; i++) {
      breaks[i] = breakMin + i * width;
    }

    const _uniqueIndices = new Set<number>();
    const _indices: number[] = [];
    const _positions = {} as Record<number, Set<number>>;
    const _labels = {} as Record<number, { binMin: Num; binMax: Num }>;
    const _meta = { breaks };

    for (let j = 0; j < values.length; j++) {
      const index = breaks.findIndex((br) => br >= values[j]) - 1;

      _uniqueIndices.add(index);
      _indices.push(index);

      if (!(index in _positions)) _positions[index] = new Set();
      if (!(index in _labels)) {
        _labels[index] = {
          binMin: num(breaks[index]),
          binMax: num(breaks[index + 1]),
        };
      }

      _positions[index].add(j);
    }

    return new FactorBinned(
      _uniqueIndices,
      _indices,
      _positions,
      _labels,
      _meta
    );
  };
}

export class FactorProduct {
  constructor(
    private _uniqueIndices: Set<number>,
    private _indices: number[],
    private _positions: Record<number, Set<number>>,
    private _labels: Record<number, Record<string, any>>,
    private _meta: Record<string, any>
  ) {}

  uniqueIndices = () => this._uniqueIndices;
  indices = () => this._indices;
  index = (position: number) => this._indices[position];
  positions = (index: number) => this._positions[index];
  label = (index: number) => this._labels[index];
  meta = () => this._meta;

  static from = <T extends Factor, U extends Factor>(
    factor1: T,
    factor2: U,
    unionOpts?: { keepSecond?: Set<string> }
  ) => {
    const meta = disjointUnion(factor1.meta(), factor2.meta(), unionOpts);

    const uniqueIndices = new Set<number>();
    const indices: number[] = [];
    const positions = {} as Record<number, Set<number>>;
    const labels = {} as Record<number, Record<string, any>>;

    const { max, floor, log10 } = Math;
    const offset = floor(log10(max(...factor2.uniqueIndices()))) + 1;

    for (let i = 0; i < factor1.indices().length; i++) {
      const [f1i, f2i] = [factor1.index(i), factor2.index(i)];
      const jointIndex = parseInt(
        [f1i, f2i.toString().padStart(offset, "0")].join("0"),
        10
      );

      uniqueIndices.add(jointIndex);
      indices.push(jointIndex);

      if (!(jointIndex in positions)) positions[jointIndex] = new Set();
      if (!(jointIndex in labels)) {
        labels[jointIndex] = disjointUnion(
          factor1.label(f1i),
          factor2.label(f2i)
        );
      }

      positions[jointIndex].add(i);
    }

    return new FactorProduct(uniqueIndices, indices, positions, labels, meta);
  };
}
