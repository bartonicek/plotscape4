import { Dataframe } from "../../structs/Dataframe";
import Marker, { Group } from "../../structs/Marker";
import { drawClear } from "../../utils/drawfuns";
import { Cols } from "../../utils/types";
import { Plot } from "../plot/Plot";
import makeSceneStore, { SceneStore } from "./makeSceneStore";

export class Scene<T extends Cols> {
  nPlots: number;
  nCols: number;
  nRows: number;

  plots: Plot[];

  marker: Marker;
  store: SceneStore;

  keyActions: Record<string, () => void>;

  constructor(public app: HTMLDivElement, public data: Dataframe<T>) {
    this.app.classList.add("plotscape-scene");

    this.nPlots = 0;
    this.nCols = 0;
    this.nRows = 0;

    const store = makeSceneStore();
    this.store = store;
    this.marker = new Marker(
      () => data.meta.n,
      store.selectedCases,
      store.group
    );

    this.plots = [];

    this.keyActions = {
      Digit1: () => this.store.setGroup(Group.Group2),
      Digit2: () => this.store.setGroup(Group.Group3),
      Digit3: () => this.store.setGroup(Group.Group4),
    };

    this.app.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("dblclick", this.onDoubleClick);
  }

  setRowsCols = (rows: number, cols: number) => {
    document.documentElement.style.setProperty("--ncols", cols.toString());
    document.documentElement.style.setProperty("--nrows", rows.toString());
  };

  pushPlot = (plot: Plot) => {
    this.plots.push(plot);

    this.nPlots++;
    this.nCols = Math.ceil(Math.sqrt(this.nPlots));
    this.nRows = Math.ceil(this.nPlots / this.nCols);

    this.setRowsCols(this.nRows, this.nCols);
    this.plots.forEach((plot) => plot.resize());
  };

  onMouseDown = (event: MouseEvent) => {
    // Clear drag rectangles
    this.plots.forEach((plot) => drawClear(plot.contexts.user));

    const isScene = (target: Element) => {
      return target.classList.contains("plotscape-scene");
    };

    const target = event.target;
    // Only deactivate if clicked outside of any plot area
    if (target instanceof Element && isScene(target)) {
      this.plots.forEach((plot) => plot.deactivate());
    }
  };

  onDoubleClick = () => {
    this.plots.forEach((plot) => plot.deactivate());
    this.marker.clearAll();
    this.store.setGroup(128);
    this.store.setSelectedCases([]);
  };

  onKeyDown = (event: KeyboardEvent) => {
    const key = event.code;
    this.keyActions[key]?.();
  };

  onKeyUp = () => {
    this.store.setGroup(128);
  };
}
