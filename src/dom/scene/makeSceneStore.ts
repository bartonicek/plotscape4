import { createSignal } from "solid-js";

const makeSceneStore = () => {
  const [group, setGroup] = createSignal(128);
  const [selectedCases, setSelectedCases] = createSignal<number[]>([]);

  return { group, selectedCases, setGroup, setSelectedCases };
};

export default makeSceneStore;
export type SceneStore = ReturnType<typeof makeSceneStore>;
