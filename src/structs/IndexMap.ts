export class IndexMap {
  map: Record<number, number>;

  constructor(
    public childIndexArray: number[],
    public parentIndexArray?: number[]
  ) {
    this.map = {};
    if (!parentIndexArray) return this;
    for (let i = 0; i < childIndexArray.length; i++) {
      if (!(childIndexArray[i] in this.map)) {
        this.map[childIndexArray[i]] = parentIndexArray?.[i] ?? 0;
      }
    }
  }

  parentIndex = (index: number) => {
    if (!this.parentIndexArray) return 0;
    return this.map[index];
  };
}
