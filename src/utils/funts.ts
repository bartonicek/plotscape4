import { Dict, Scalar, ValueOf } from "./types";

export const identity = <T>(x: T) => x;
export const secondArgument = <T>(x: any, y: T) => y;
export const POJO = () => ({});

export const keys = <T extends Dict, K extends keyof T>(x: T) => {
  return Object.keys(x) as K[];
};
export const values = <T extends Dict, K extends keyof T>(x: T) => {
  return Object.values(x) as T[K][];
};
export const entries = <T extends Dict, K extends keyof T>(x: T) => {
  return Object.entries(x) as { [key in K]: [key, T[key]] }[K][];
};

export const unwrapAll = <T extends Record<string, Scalar>>(obj: T) => {
  const result = {} as { [key in keyof T]: ValueOf<T[key]> };
  for (const [k, v] of entries(obj)) result[k] = v.value() as any;
  return result;
};

export const getData = async (path: string) => {
  const result = await fetch(path);
  return await result.json();
};

export const minMax = (x: number[]) => {
  let [min, max] = [Infinity, -Infinity];
  for (let i = 0; i < x.length; i++) {
    min = Math.min(min, x[i]);
    max = Math.max(max, x[i]);
  }
  return [min, max];
};
export const minMaxSum = (x: number[]) => {
  let [min, max, sum] = [Infinity, -Infinity, 0];
  for (let i = 0; i < x.length; i++) {
    min = Math.min(min, x[i]);
    max = Math.max(max, x[i]);
    sum += x[i];
  }
  return [min, max, sum];
};

export const disjointUnion = <T extends Dict, U extends Dict>(
  object1: T,
  object2: U,
  options?: { keepSecond?: Set<string> }
): T & U => {
  const result = {} as T & U;

  for (const [key, value] of Object.entries(object1)) {
    if (options?.keepSecond?.has(key)) continue;
    result[key as keyof T] = value;
  }

  for (const [key, value] of Object.entries(object2)) {
    if (key in result) {
      const name = key.match(/[a-zA-Z]+/g)?.[0] ?? "default";
      const number = parseInt(key.match(/\d+$/)?.[0] ?? "0", 10);

      const oldKey = (name + number) as keyof U;
      const newKey = (name + (number + 1)) as keyof U;

      result[oldKey] = result[key];
      result[newKey] = value;
      delete result[key];

      continue;
    }

    result[key as keyof U] = value;
  }

  return result;
};
