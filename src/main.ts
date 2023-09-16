import { createRoot } from "solid-js";
import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { getData } from "./utils/funs";
import { BarPlot } from "./wrappers.ts/BarPlot";

const app = document.querySelector("#app") as HTMLDivElement;
const mpg = await getData("./testData/mtcars.json");

const dataMpg = Dataframe.parseCols(mpg, {
  cyl: "discrete",
  am: "discrete",
});

createRoot(() => {
  const scene1 = new Scene(app, dataMpg);
  const barplot1 = new BarPlot(scene1, { var1: "cyl" });
  const barplot2 = new BarPlot(scene1, { var1: "am" });
});
