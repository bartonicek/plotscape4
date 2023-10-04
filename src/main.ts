import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import { Discrete, Numeric, Reference } from "./structs/Variable";
import "./style.css";
import { getData, minMax } from "./utils/funs";
import { BarPlot } from "./wrappers.ts/BarPlot";
import { HistoPlot } from "./wrappers.ts/HistoPlot";

const app = document.querySelector("#app") as HTMLDivElement;
const mpg = await getData("./testData/mpg.json");

const dataMpg = Dataframe.parseCols(mpg, {
  drv: "discrete",
  trans: "discrete",
  manufacturer: "discrete",
  hwy: "numeric",
});

createRoot(() => {
  const scene1 = new Scene(app, dataMpg);
  const barplot1 = new BarPlot(scene1, (d) => ({ var1: d.manufacturer }));
  const histoplot1 = new HistoPlot(scene1, (d) => ({ var1: d.hwy }));
  // const scatterplot1 = new ScatterPlot(scene1, (d) => ({
  //   var1: d.hwy,
  //   var2: d.hwy,
  // }));

  scene1.setRowsCols(2, 1);
});

class Factor {
  constructor(
    public indices: number[],
    public uniqueIndices: Set<number>,
    public indexMap: Record<number, number>,
    public data: Dataframe<any>
  ) {}

  static from = (array: string[], labels?: string[]) => {
    labels = labels ?? Array.from(new Set(array)).sort();

    const indices: number[] = [];
    const uniqueIndices = new Set<number>();
    const positions = { length: 0 } as any;
    const indexMap: Record<number, number> = {};

    for (let i = 0; i < array.length; i++) {
      const index = labels.indexOf(array[i]);

      if (!uniqueIndices.has(index)) {
        uniqueIndices.add(index);
        positions[index] = new Set<number>();
        positions.length++;
      }

      indices.push(index);
      positions[index].add(i);
    }

    const data = new Dataframe({
      labels: Discrete.from(labels),
      positions: Reference.from(Object.values(positions)),
    });

    return new Factor(indices, uniqueIndices, indexMap, data);
  };

  static bin = (array: number[], width?: number, anchor?: number) => {
    const [min, max] = minMax(array);
    const nbins = width
      ? Math.ceil((max - min) / width) + 1
      : array.length < 10
      ? array.length
      : 10;

    width = width ?? (max - min) / (nbins - 1);
    anchor = anchor ?? min;

    const breakMin = min - width + ((anchor - min) % width);

    const breaks = Array(nbins + 2);
    for (let j = 0; j < breaks.length; j++) {
      breaks[j] = breakMin + j * width;
    }

    const uniqueIndices = new Set<number>();
    const indices: number[] = [];
    const positions = {} as Record<number, Set<number>>;
    const indexMap = {} as Record<number, number>;

    for (let i = 0; i < array.length; i++) {
      const index = breaks.findIndex((br) => br >= array[i]) - 1;

      if (!uniqueIndices.has(index)) {
        uniqueIndices.add(index);
        positions[index] = new Set();
      }

      indices.push(index);
      positions[index].add(i);
    }

    let row = 0;
    const [binMin, binMax]: [number[], number[]] = [[], []];
    for (const index of uniqueIndices) {
      indexMap[index] = row++;
      binMin.push(breaks[index]);
      binMax.push(breaks[index + 1]);
    }

    const data = new Dataframe({
      positions: Reference.from(Object.values(positions)),
      binMin: Numeric.from(binMin),
      binMax: Numeric.from(binMax),
    });

    console.log(array, nbins, breaks);

    return new Factor(indices, uniqueIndices, indexMap, data);
  };

  label = (index: number) => {
    return this.data.row(this.indexMap[index]);
  };
}

const factor1 = Factor.from(["b", "a", "a", "b", "a", "c"]);
const factor2 = Factor.bin([1, 2, 1, 1, 3, 3, 1]);

console.log(factor2.data.unwrapRows());
