export function useSimlpeFunctions() {
  const xyToIndex = (x, y) => {
    return x * 16 + y;
  };
  const indexToXY = (index) => {
    const x = Math.floor(index / 16);
    const y = index % 16;
    return { x, y };
  };
  const outBounds = (x, y) => {
    return x < 0 || y < 0 || x > 15 || y > 15;
  };
  const random = () => {
    let rand = -0.5 + Math.random() * 256;
    const coordinate = Math.round(rand);

    return indexToXY(coordinate);
  };

  return {
    xyToIndex,
    indexToXY,
    outBounds,
    random,
  };
}
