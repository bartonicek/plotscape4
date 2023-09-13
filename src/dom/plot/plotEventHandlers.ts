import { toInt } from "../../utils/funs";
import { Plot } from "./Plot";

export const onResize = (plot: Plot<any>) => () => {
  const { setWidth, setHeight } = plot.store;
  setWidth(toInt(getComputedStyle(plot.container)["width"]));
  setHeight(toInt(getComputedStyle(plot.container)["height"]));
};
