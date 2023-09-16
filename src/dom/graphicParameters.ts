const graphicParameters = {
  axisOffset: 5,
  radius: 3,
  width: 0.8,
  alpha: 1,
  colour: "#4682B4",
  groupColours: [`#D1D5DE`, `#E41A1C`, `#4DAF4A`, `#984EA3`],
  transientColour: `#377EB8`,
  fontsize: 16,
  marginLines: [4, 4, 2, 2] as const,
  defaultNorm: {
    x: { lower: 0.05, upper: 0.95 },
    y: { lower: 0.05, upper: 0.95 },
  },
};

export default graphicParameters;
