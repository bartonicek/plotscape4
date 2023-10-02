import { batch, createEffect } from "solid-js";
import html from "solid-js/html";
import { AxisLabels } from "../../decorations/AxisLabels";
import { Decoration } from "../../decorations/Decoration";
import { Representation } from "../../representations/Representation";
import { drawClear, drawRect } from "../../utils/drawfuns";
import { call, diff, throttle, toInt } from "../../utils/funs";
import graphicParameters from "../graphicParameters";
import { Scene } from "../scene/Scene";
import { Contexts, contexts } from "./Context";
import { makeCanvasContext } from "./makeCanvasContext";
import makeExpanses, { PlotExpanses } from "./makeExpanses";
import makePlotStore, { PlotStore } from "./makePlotStore";
import makeScales, { PlotScales } from "./makeScales";

export class Plot {
  container: HTMLDivElement;
  // state: PlotStateMachine;

  store: PlotStore;
  expanses: PlotExpanses;
  scales: PlotScales;
  contexts: Contexts;

  representations: Representation[];
  decorations: Decoration[];

  keyActions: Record<string, () => void>;

  constructor(public scene: Scene<any>) {
    const container = html`<div
      class="plotscape-container"
    ></div>` as HTMLDivElement;
    this.container = container;
    scene.app.appendChild(container);

    // this.state = new PlotStateMachine(this);

    window.addEventListener("resize", throttle(this.onResize, 50));
    container.addEventListener("mousedown", this.onMouseDown);

    // container.addEventListener("mousedown", this.state.dispatch);

    container.addEventListener("contextmenu", this.onContextMenu);
    container.addEventListener("mouseup", this.onMouseUp);
    container.addEventListener("mousemove", throttle(this.onMouseMove, 30));
    window.addEventListener("keydown", throttle(this.onKeyDown, 50));

    const store = makePlotStore();
    const expanses = makeExpanses(store);
    const scales = makeScales(expanses);

    this.store = store;
    this.expanses = expanses;
    this.scales = scales;

    this.contexts = {} as Contexts;
    for (const ctx of contexts) {
      const opts = { inner: ctx != "over", classes: [`${ctx}`] };
      this.contexts[ctx] = makeCanvasContext(this, opts);
    }

    this.representations = [];
    this.decorations = [];

    this.pushDecoration(new AxisLabels(this, "x"));
    this.pushDecoration(new AxisLabels(this, "y"));

    const { defaultNorm } = graphicParameters;
    this.keyActions = {
      KeyR: () => {
        this.store.setNormXLower(defaultNorm.x.lower);
        this.store.setNormYLower(defaultNorm.y.lower);
        this.store.setNormXUpper(defaultNorm.x.upper);
        this.store.setNormYUpper(defaultNorm.y.upper);
      },
      KeyZ: () => {
        const { clickX, clickY, mouseX, mouseY } = this.store;
        const { innerH, innerV, normX, normY } = this.expanses;

        const [xLower, xUpper] = [clickX, mouseX]
          .map(call)
          .sort(diff)
          .map(innerH.normalize)
          .map(normX.normalize);

        const [yLower, yUpper] = [clickY, mouseY]
          .map(call)
          .sort(diff)
          .map(innerV.normalize)
          .map(normY.normalize);

        const xRange = 1 / (xUpper - xLower);
        const yRange = 1 / (yUpper - yLower);
        this.store.setNormXLower(-xLower * xRange);
        this.store.setNormXUpper(-xLower * xRange + xRange);
        this.store.setNormYLower(-yLower * yRange);
        this.store.setNormYUpper(-yLower * yRange + yRange);
        scene.marker.clearTransient();
        drawClear(this.contexts.user);
      },
    };

    scene.pushPlot(this);
  }

  pushRepresentation = (representation: Representation) => {
    this.representations.push(representation);
    createEffect(() => representation.draw());
  };

  pushDecoration = (decoration: Decoration) => {
    this.decorations.push(decoration);
    createEffect(() => decoration.draw());
  };

  resize = () => this.onResize();

  activate = () => {
    this.store.setActive(true);
    this.container.classList.add("active");
  };

  deactivate = () => {
    this.store.setActive(false);
    this.container.classList.remove("active");
    drawClear(this.contexts.user);
  };

  onResize = () => {
    const { setWidth, setHeight } = this.store;
    setWidth(toInt(getComputedStyle(this.container)["width"]));
    setHeight(toInt(getComputedStyle(this.container)["height"]));
    this.representations.forEach((rep) => rep.draw());
    this.decorations.forEach((dec) => dec.draw());
  };

  onMouseDown = (event: MouseEvent) => {
    const {
      height,
      marginBottom,
      marginLeft,
      setHolding,
      setClickX,
      setClickY,
      setMouseX,
      setMouseY,
    } = this.store;

    this.scene.plots.forEach((plot) => plot.deactivate());
    this.scene.marker.clearTransient();
    this.activate();

    const x = event.offsetX - marginLeft();
    const y = height() - event.offsetY - marginBottom();

    setHolding(true);
    batch(() => {
      setClickX(x), setClickY(y), setMouseX(x), setMouseY(y);
    });

    const { setSelectedCases } = this.scene.store;

    if (event.button === 0) {
      this.representations.forEach((rep) =>
        setSelectedCases(rep.checkSelection([x, y, x, y]))
      );
    }
  };

  onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    this.store.setRightButtonClicked(true);
  };

  onMouseUp = () => {
    this.store.setRightButtonClicked(false);
    this.store.setHolding(false);
  };

  onMouseMove = (event: MouseEvent) => {
    const { store, contexts, scene, representations } = this;

    if (!store.holding()) return;

    const { height, marginLeft, marginBottom, setMouseX, setMouseY } = store;

    const x = event.offsetX - marginLeft();
    const y = height() - event.offsetY - marginBottom();

    if (store.rightButtonClicked()) {
      const { mouseX, mouseY, width, height } = store;

      const xMove = (x - mouseX()) / width();
      const yMove = (y - mouseY()) / height();

      store.setNormXLower((val) => val + xMove);
      store.setNormXUpper((val) => val + xMove);
      store.setNormYLower((val) => val + yMove);
      store.setNormYUpper((val) => val + yMove);

      batch(() => {
        setMouseX(x), setMouseY(y);
      });

      return;
    }

    // Draw the selection rectangle
    const { clickX, clickY, mouseX, mouseY } = store;
    const [x0, x1, y0, y1] = [clickX, mouseX, clickY, mouseY].map(call);

    drawClear(contexts.user);
    drawRect(contexts.user, x0, y0, x1, y1, { alpha: 0.25 });

    scene.marker.clearTransient();

    batch(() => {
      setMouseX(x), setMouseY(y);
    });

    const { setSelectedCases } = scene.store;

    representations.forEach((rep) =>
      setSelectedCases(rep.checkSelection([x0, y0, x1, y1]))
    );
  };

  onKeyDown = (event: KeyboardEvent) => {
    if (!this.store.active()) return;
    this.keyActions[event.code]?.();
  };

  onKeyUp = () => {
    this.scene.store.setGroup(128);
  };
}
