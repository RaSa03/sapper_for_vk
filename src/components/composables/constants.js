export function useConstants() {
  const DIGITS_COLOR = {
    1: "blue",
    2: "green",
    3: "red",
    4: "navy",
    5: "darkred",
    6: "teal",
    7: "black",
    8: "grey",
  };
  const SMILE_STATUS = {
    waiting: "smile",
    inGame: "smile",
    gameOver: "loss",
    win: "win",
  };
  return {
    DIGITS_COLOR,
    SMILE_STATUS,
  };
}
