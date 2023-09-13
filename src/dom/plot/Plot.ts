import html from "solid-js/html";
import { Cols } from "../../utils/types";
import { Scene } from "../scene/Scene";
import { Contexts, contexts } from "./Context";
import { makeCanvasContext } from "./makeCanvasContext";
import { PlotExpanses } from "./makeExpanses";
import { PlotStore } from "./makePlotStore";
import { PlotScales } from "./makeScales";
import { onResize } from "./plotEventHandlers";

export class Plot<T extends Cols> {
  container: HTMLDivElement;

  store: PlotStore;
  expanses: PlotExpanses;
  scales: PlotScales;
  contexts: Contexts;

  representations: Representation[];
  decorations: any[];

  constructor(public scene: Scene<T>) {
    this.container = html`<div
      class="plotscape-container"
    ></div>` as HTMLDivElement;
    scene.app.appendChild(this.container);

    // window.addEventListener("resize", throttle(onResize(this), 50));

    // const store = makePlotStore();
    // const expanses = makeExpanses(store);
    // const scales = makeScales(expanses);

    // this.store = store;
    // this.expanses = expanses;
    // this.scales = scales;

    this.contexts = {} as Contexts;
    for (const ctx of contexts) {
      const opts = { inner: ctx != "over", classes: [`${ctx}`] };
      this.contexts[ctx] = makeCanvasContext(this, opts);
    }

    // this.representations = [];
    // this.decorations = [];

    scene.pushPlot(this);
  }

  resize = () => {
    onResize(this)();
    // this.representations.forEach((rep) => rep.draw());
    // this.decorations.forEach((dec) => dec.draw());
  };

  activate = () => {
    this.store.setActive(true);
    this.container.classList.add("active");
  };

  deactivate = () => {
    this.store.setActive(false);
    this.container.classList.remove("active");
    // clear(this.contexts.user);
  };
}
