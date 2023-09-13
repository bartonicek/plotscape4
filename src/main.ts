import { Scene } from "./dom/scene/Scene";
import { Dataframe } from "./structs/Dataframe";
import "./style.css";
import { getData } from "./utils/funs";
import { BarPlot } from "./wrappers.ts/BarPlot";

const app = document.querySelector("#app") as HTMLDivElement;
const mpg = await getData("./testData/mpg.json");

const dataMpg = Dataframe.parseCols(mpg, {
  hwy: "numeric",
  manufacturer: "discrete",
}).select({ var1: "manufacturer" });

const scene1 = new Scene(app, dataMpg);
const barplot1 = new BarPlot(scene1);
