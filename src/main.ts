import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { getData } from "./utils/funs";
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
  const barplot1 = new BarPlot(scene1, { var1: "manufacturer" });
  const histoplot1 = new HistoPlot(scene1, { var1: "hwy" });
  scene1.setRowsCols(2, 1);
});
