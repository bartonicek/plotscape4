import { ref } from "../structs/Scalar";
import { ValueLike } from "../structs/ValueLike";
import { Expanse } from "./Expanse";

export type Scale = {
  pushforward: (x: any) => number;
  pullback: (x: number) => any;
  breaks: () => any[];

  setDomain?: (lower: any, upper: any) => Scale;
  setNorm: (lower: any, upper: any) => Scale;
  setCodomain: (lower: any, upper: any) => Scale;
  setValues?: (values: ValueLike<string[]>) => Scale;
};

export class ScaleLinear implements Scale {
  constructor(
    public domain: Expanse,
    public norm: Expanse,
    public codomain: Expanse
  ) {}

  static default = () => {
    return new ScaleLinear(
      Expanse.default(),
      Expanse.default(),
      Expanse.default()
    );
  };

  pushforward = (x: number) => {
    const { domain, norm, codomain } = this;
    return codomain.unnormalize(norm.unnormalize(domain.normalize(x)));
  };

  pullback = (x: number) => {
    const { domain, norm, codomain } = this;
    return domain.unnormalize(norm.normalize(codomain.normalize(x)));
  };

  setDomain = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.domain.lower = lower;
    this.domain.upper = upper;
    return this;
  };

  setNorm = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.norm.lower = lower;
    this.norm.upper = upper;
    return this;
  };

  setCodomain = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.codomain.lower = lower;
    this.codomain.upper = upper;
    return this;
  };

  breaks = (n = 4) => {
    const { domain, norm } = this;

    const [lower, upper] = [
      domain.unnormalize(norm.normalize(0)),
      domain.unnormalize(norm.normalize(1)),
    ];

    const unitGross = (upper - lower) / n;
    const base = Math.floor(Math.log10(unitGross));

    const candidateVals = [1, 2, 4, 5, 10];
    let [minDist, neatValue] = [Infinity, 0];

    for (let i = 0; i < candidateVals.length; i++) {
      const dist = (candidateVals[i] * 10 ** base - unitGross) ** 2;
      if (dist < minDist) [minDist, neatValue] = [dist, candidateVals[i]];
    }

    const unitNeat = 10 ** base * neatValue;

    const minNeat = Math.ceil(lower / unitNeat) * unitNeat;
    const maxNeat = Math.floor(upper / unitNeat) * unitNeat;

    const n2 = Math.round((maxNeat - minNeat) / unitNeat);
    const breaks = [parseFloat(minNeat.toFixed(4))];

    for (let i = 1; i < n2; i++) {
      const value = minNeat + i * unitNeat;
      breaks.push(parseFloat(value.toFixed(4)));
    }
    breaks.push(parseFloat(maxNeat.toFixed(4)));

    return breaks;
  };
}

export class ScaleDiscrete implements Scale {
  constructor(
    public values: ValueLike<string[]>,
    public norm: Expanse,
    public codomain: Expanse
  ) {}

  static default = () => {
    return new ScaleDiscrete(ref([]), Expanse.default(), Expanse.default());
  };

  pushforward = (x: string) => {
    const { values, norm, codomain } = this;

    const vals = values.value();
    const pct = (vals.indexOf(x) + 1) / (vals.length + 1);

    return codomain.unnormalize(norm.unnormalize(pct));
  };

  pullback = (x: number) => {
    const { values, norm, codomain } = this;

    const vals = values.value();
    const pct = norm.normalize(codomain.normalize(x));

    return vals[Math.round(pct * (vals.length + 1)) - 1];
  };

  setValues = (values: ValueLike<string[]>) => {
    this.values = values;
    return this;
  };

  setNorm = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.norm.lower = lower;
    this.norm.upper = upper;
    return this;
  };

  setCodomain = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.codomain.lower = lower;
    this.codomain.upper = upper;
    return this;
  };

  breaks = () => this.values.value();
}

export class ScalePlaceholder implements Scale {
  constructor(public norm: Expanse, public codomain: Expanse) {}

  static default = () => {
    return new ScalePlaceholder(Expanse.default(), Expanse.default());
  };

  setNorm = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.norm.lower = lower;
    this.norm.upper = upper;
    return this;
  };

  setCodomain = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    this.codomain.lower = lower;
    this.codomain.upper = upper;
    return this;
  };

  setDomain = (lower: ValueLike<number>, upper: ValueLike<number>) => {
    return new ScaleLinear(new Expanse(lower, upper), this.norm, this.codomain);
  };

  setValues = (values: ValueLike<string[]>) => {
    return new ScaleDiscrete(values, this.norm, this.codomain);
  };

  pushforward = () => 0;
  pullback = () => undefined;

  breaks = () => [];
}
