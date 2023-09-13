import graphicParameters from "../graphicParameters";
import { createSignal } from "solid-js";
import { just } from "../../utils/funs";
import { ExpanseSetter } from "../../scales.ts/Expanse";

const makePlotStore = () => {
  const [active, setActive] = createSignal(false);

  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);

  const [rightButtonClicked, setRightButtonClicked] = createSignal(false);
  const [holding, setHolding] = createSignal(false);
  const [mouseX, setMouseX] = createSignal(0);
  const [mouseY, setMouseY] = createSignal(0);
  const [clickX, setClickX] = createSignal(0);
  const [clickY, setClickY] = createSignal(0);

  const { marginLines, fontsize } = graphicParameters;
  const marginBottom = just(marginLines[0] * fontsize);
  const marginLeft = just(marginLines[1] * fontsize);
  const marginTop = just(marginLines[2] * fontsize);
  const marginRight = just(marginLines[3] * fontsize);

  const innerClickX = () => {
    return clickX() - marginLeft();
  };

  const innerWidth = () => width() - marginLeft() - marginRight();
  const innerHeight = () => height() - marginBottom() - marginTop();
  const innerLeft = marginLeft;
  const innerRight = () => width() - marginRight();
  const innerBottom = marginBottom;
  const innerTop = () => height() - marginTop();

  const [normXLower, _setNormXLower] = createSignal(0);
  const [normXUppper, _setNormXUpper] = createSignal(1);
  const [normYLower, _setNormYLower] = createSignal(0);
  const [normYUpper, _setNormYUpper] = createSignal(1);

  const normX = new ExpanseSetter(normXLower, normXUppper);
  const normY = new ExpanseSetter(normYLower, normYUpper);

  const setNormXLower = normX.setLower;
  const setNormXUpper = normX.setUpper;
  const setNormYLower = normY.setLower;
  const setNormYUpper = normY.setUpper;

  const [labelInterval, setLabelInterval] = createSignal(1);
  const [labelCycle, setLabelCycle] = createSignal(0);

  const store = {
    active,
    width,
    height,
    rightButtonClicked,
    holding,
    mouseX,
    mouseY,
    clickX,
    clickY,
    innerWidth,
    innerHeight,
    innerLeft,
    innerRight,
    innerTop,
    innerBottom,
    marginBottom,
    marginLeft,
    marginTop,
    marginRight,
    innerClickX,
    normXLower,
    normXUppper,
    normYLower,
    normYUpper,
    labelInterval,
    labelCycle,
    setActive,
    setWidth,
    setHeight,
    setRightButtonClicked,
    setHolding,
    setMouseX,
    setMouseY,
    setClickX,
    setClickY,
    setNormXLower,
    setNormXUpper,
    setNormYLower,
    setNormYUpper,
    setLabelInterval,
    setLabelCycle,
    normX,
    normY,
  };

  return store;
};

export default makePlotStore;
export type PlotStore = ReturnType<typeof makePlotStore>;
