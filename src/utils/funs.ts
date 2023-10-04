import { Dict, Fn, Scalar, ValueOf } from "./types";

export const call = (fn: Fn) => fn();
export const lazy =
  <T>(x: T) =>
  () =>
    x;
export const noop = () => {};
export const identity = <T>(x: T) => x;
export const firstArgument = <T>(x: T, y: any) => x;
export const secondArgument = <T>(x: any, y: T) => y;
export const POJO = () => ({});

export const abs = Math.abs;
export const toInt = (x: string) => parseInt(x, 10);

export const diff = (x: number, y: number) => x - y;

export const keys = <T extends Dict, K extends keyof T>(x: T) => {
  return Object.keys(x) as K[];
};
export const allKeys = <T extends Dict, K extends keyof T>(x: T) => {
  return Reflect.ownKeys(x) as K[];
};

export const values = <T extends Dict, K extends keyof T>(x: T) => {
  return Object.values(x) as T[K][];
};
export const entries = <T extends Dict, K extends keyof T>(x: T) => {
  return Object.entries(x) as { [key in K]: [key, T[key]] }[K][];
};

export const unwrapAll = <T extends Record<string, Scalar>>(obj: T) => {
  const result = {} as { [key in keyof T]: ValueOf<T[key]> };
  for (const [k, v] of entries(obj)) result[k] = v?.value?.() as any;
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
  options?: { keepSecond?: Set<string | symbol> }
): T & U => {
  const result = {} as T & U;

  for (const key of Reflect.ownKeys(object1)) {
    if (options?.keepSecond?.has(key)) continue;
    result[key as keyof T] = object1[key];
  }

  for (const key of Reflect.ownKeys(object2)) {
    if (key in result) {
      if (typeof key === "symbol") {
        result[key as keyof T & U] = object2[key];
        continue;
      }

      const name = key.match(/[a-zA-Z]+/g)?.[0] ?? "default";
      const number = parseInt(key.match(/\d+$/)?.[0] ?? "0", 10);

      const oldKey = (name + number) as keyof U;
      const newKey = (name + (number + 1)) as keyof U;

      result[oldKey] = result[key];
      result[newKey] = object2[key];
      delete result[key];

      continue;
    }

    result[key as keyof U] = object2[key];
  }

  return result;
};

export const rectOverlap = (
  rect1x: [number, number],
  rect1y: [number, number],
  rect2x: [number, number],
  rect2y: [number, number]
) => {
  const [r1xmin, r1xmax] = minMax(rect1x);
  const [r1ymin, r1ymax] = minMax(rect1y);
  const [r2xmin, r2xmax] = minMax(rect2x);
  const [r2ymin, r2ymax] = minMax(rect2y);

  return !(
    r1xmax < r2xmin || // If any holds, rectangles don't overlap
    r1xmin > r2xmax ||
    r1ymax < r2ymin ||
    r1ymin > r2ymax
  );
};

export const throttle = (fun: Function, delay: number) => {
  let lastTime = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastTime < delay) return;
    lastTime = now;
    fun(...args);
  };
};
