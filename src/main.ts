import { Scene } from "./dom/Scene";
import { Dataframe } from "./structs/Dataframe";
import { getData } from "./utils/funts";
import { BarPlot } from "./wrappers.ts/BarPlot";

const mpg = await getData("./testData/mpg.json");

const dataMpg = Dataframe.parseCols(mpg, {
  hwy: "numeric",
  manufacturer: "discrete",
}).select({ var1: "manufacturer" });

const scene1 = new Scene(dataMpg);
const barplot1 = new BarPlot(scene1);
