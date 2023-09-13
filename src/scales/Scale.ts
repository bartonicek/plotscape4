import { ValueLike } from "../structs/ValueLike";
import { Expanse } from "./Expanse";

export type Scale<T> = {
  pushforward: (x: T) => number | undefined;
  pullback: (x: number) => T | undefined;
};

export class ScaleLinear implements Scale<number> {
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
}

export class ScaleDiscrete implements Scale<string> {
  constructor(
    public values: ValueLike<string[]>,
    public norm: Expanse,
    public codomain: Expanse
  ) {}

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
}

export class ScalePlaceholder implements Scale<any> {
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

  pushforward = () => undefined;
  pullback = () => undefined;
}
