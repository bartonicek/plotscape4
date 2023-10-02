import { batch } from "solid-js";
import { Plot } from "./Plot";

type PlotState = Active | Inactive;

const plotEventTypes = ["mousedown", "mouseup"] as const;
type PlotEventType = (typeof plotEventTypes)[number];
type StateInstance = { [key in PlotEventType]: (event: any) => void };

const isPlotEventType = (eventType: string): eventType is PlotEventType => {
  return plotEventTypes.includes(eventType as PlotEventType);
};

export class PlotStateMachine {
  state: PlotState;
  constructor(public plot: Plot) {
    this.state = new Inactive(plot);
  }

  dispatch = (event: Event) => {
    if (isPlotEventType(event.type)) {
      this.state = this.state[event.type](event as any);
    }
  };
}

class Inactive implements StateInstance {
  constructor(public plot: Plot) {}

  activate = () => new Active(this.plot);
  deactivate = () => this;

  mousedown = (event: MouseEvent) => {
    const { scene, store } = this.plot;
    for (const p of scene.plots) p.state.dispatch(new Event("deactivate"));

    scene.marker.clearTransient();
    const x = event.offsetX - store.marginLeft();
    const y = store.height() - event.offsetY - store.marginBottom();

    batch(() => {
      store.setClickX(x);
      store.setClickY(y);
      store.setMouseX(x);
      store.setMouseY(y);
    });

    return this.activate();
  };

  mouseup = () => this;
}

class Active implements StateInstance {
  constructor(public plot: Plot) {}

  activate = () => this;
  deactivate = () => new Inactive(this.plot);

  mousedown = (event: MouseEvent) => {
    // const { scene, store } = this.plot;
    // scene.marker.clearTransient();
    // const x = event.offsetX - store.marginLeft();
    // const y = store.height() - event.offsetY - store.marginBottom();
    // batch(() => {
    //   store.setClickX(x);
    //   store.setClickY(y);
    //   store.setMouseX(x);
    //   store.setMouseY(y);
    // });
    return this.activate();
  };
  mouseup = () => this.deactivate();
}
