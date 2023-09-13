import { Dataframe } from "../../structs/Dataframe";
import Marker, { Group } from "../../structs/Marker";
import { Cols } from "../../utils/types";
import { Plot } from "../plot/Plot";
import makeSceneStore, { SceneStore } from "./makeSceneStore";

export class Scene<T extends Cols> {
  nPlots: number;
  nCols: number;
  nRows: number;

  plots: Plot<T>[];

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

    // createEffect(() => {
    //   this.app.addEventListener("mousedown", onMousedown(this));
    //   window.addEventListener("keydown", onKeyDown(this));
    //   window.addEventListener("keyup", onKeyUp(this));
    //   window.addEventListener("dblclick", onDoubleClick(this));
    // });
  }

  setRowsCols = (rows: number, cols: number) => {
    document.documentElement.style.setProperty("--ncols", cols.toString());
    document.documentElement.style.setProperty("--nrows", rows.toString());
  };

  pushPlot = (plot: Plot<T>) => {
    this.plots.push(plot);
    plot.resize();

    this.nPlots++;
    this.nCols = Math.ceil(Math.sqrt(this.nPlots));
    this.nRows = Math.ceil(this.nPlots / this.nCols);

    this.setRowsCols(this.nRows, this.nCols);
  };
}
