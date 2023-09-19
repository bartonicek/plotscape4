import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { entries, getData } from "./utils/funs";
import { KeysOfType } from "./utils/types";
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
  const barplot1 = new BarPlot(scene1, { var1: "drv" });
  const histoplot1 = new HistoPlot(scene1, { var1: "hwy" });
});

const data = {
  name: ["Bob", "Alice", "John"],
  income: [100, 200, 150],
  drives: [true, false, true],
};

const select = <
  T extends Record<string, any[]>,
  U extends { [key in string]: KeysOfType<T, number[]> }
>(
  data: T,
  mapping: U
) => {
  const result = {} as { [key in keyof U]: T[U[key]] };
  for (const [k, v] of entries(mapping)) result[k] = data[v];
  return result;
};

type X = KeysOfType<typeof data, number[]>;

const x = select(data, { var1: "income" });
