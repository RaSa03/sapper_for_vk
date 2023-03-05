<script setup>
import { ref, onBeforeMount } from "vue";
const mines = ref([]);
const cells = ref(Array(256).fill(false));
const flags = ref([]);
const bombs = ref(0);
const secunds = ref(0);
const gameStatus = ref("waiting");
const fear = ref(false);
const smileSatus = {
  waiting: "smile",
  inGame: "smile",
  gameOver: "loss",
  win: "win",
};
const openedCells = ref(0);
let start = "";
let fearTimeout = "";

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
onBeforeMount(() => {
  fillMinesAndCells();
});

const indexToXY = (index) => {
  const x = Math.floor(index / 16);
  const y = index % 16;
  return { x, y };
};

const stopwatch = () => {
  stopTheStopwatch();
  start = setInterval(() => secunds.value++, 1000);
};
const stopTheStopwatch = (condition) => {
  clearInterval(start);
  if (condition) return;
  secunds.value = 0;
};
const fillMinesAndCells = () => {
  for (let i = 0; i < 256; i++) {
    flags.value[i] = false;
    cells.value[i] = false;
  }
  for (let i = 0; i < 16; i++) {
    let arr = [];
    for (let j = 0; j < 16; j++) {
      arr[j] = 0;
    }
    mines.value[i] = arr;
  }
};
const outBounds = (x, y) => {
  return x < 0 || y < 0 || x > 15 || y > 15;
};
const clearGame = () => {
  stopTheStopwatch();
  gameStatus.value = "waiting";
  openedCells.value = 0;
  fillMinesAndCells();
  bombs.value = 0;
};

const startGame = (startPositionX, startPositionY) => {
  stopwatch();
  console.log(startPositionX, startPositionY);
  while (bombs.value < 40) {
    const { x, y } = random();
    if (x === startPositionX && y === startPositionY) {
      console.log(x, y);
      continue;
    } else if (mines.value[x][y] !== "bomb") {
      mines.value[x][y] = "bomb";
      bombs.value++;
      for (let offsetX = -1; offsetX <= 1; offsetX++) {
        for (let offsetY = -1; offsetY <= 1; offsetY++) {
          if (
            !outBounds(offsetX + x, offsetY + y) &&
            mines.value[offsetX + x][offsetY + y] !== "bomb"
          )
            mines.value[offsetX + x][offsetY + y] += 1;
        }
      }
    }
  }
};

const isAmine = (index) => {
  const { x, y } = indexToXY(index);
  if (mines.value[x][y] === "bomb") return true;
  return false;
};
const random = () => {
  let rand = -0.5 + Math.random() * 256;
  const coordinate = Math.round(rand);

  return indexToXY(coordinate);
};
const howManyBombs = (index) => {
  const { x, y } = indexToXY(index);
  return mines.value[x][y];
};

const xyToIndex = (x, y) => {
  return x * 16 + y;
};
const gameOver = (index) => {
  gameStatus.value = "gameOver";
  stopTheStopwatch("just stop");
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if (mines.value[i][j] === "bomb") {
        let index = xyToIndex(i, j);
        cells.value[index] = true;
      }
    }
  }
  for (let i = 0; i < flags.value.length; i++) {
    if (flags.value[i]) {
      cells.value[i] = "x";
    }
  }
  cells.value[index] = "red";
};
const gameWin = () => {
  gameStatus.value = "win";
  stopTheStopwatch("just stop");
};
const clickCell = (index) => {
  const { x, y } = indexToXY(index);
  fear.value = false;
  clearTimeout(fearTimeout);
  if (cells.value[index] || flags.value[index]) {
    return;
  }
  if (gameStatus.value === "waiting") {
    startGame(x, y);
    gameStatus.value = "inGame";
  }
  cells.value[index] = true;
  if (mines.value[x][y] === "bomb") {
    gameOver(index);
  } else if (mines.value[x][y] === 0) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (!outBounds(x + i, y + j)) clickCell(xyToIndex(x + i, y + j));
      }
    }
  }
  openedCells.value++;
  if (openedCells.value === 216 && bombs.value === 0) gameWin();
};
const putUpFlagOrFear = (idx) => {
  const putFlag = (index) => {
    if (!cells.value[index] && bombs.value > 0 && !flags.value[index]) {
      flags.value[index] = true;
      bombs.value--;
      if (openedCells.value === 216 && bombs.value === 0) gameWin();
    } else if (flags.value[index] === true) {
      flags.value[index] = "?";
      bombs.value++;
    } else flags.value[index] = false;
  };
  if (event.button === 2) {
    putFlag(idx);
  } else if (event.button === 0) {
    fearTimeout = setTimeout(() => {
      fear.value = true;
      setTimeout(() => {
        fear.value = false;
        putFlag(idx);
      }, 1500);
    }, 200);
  }
};
</script>

<template>
  <div class="wrapper">
    <div class="sapper">
      <div class="results_window">
        <div class="bombs"><span v-if="bombs < 10">0</span>0{{ bombs }}</div>
        <button class="btn-smiley">
          <div @click="clearGame" class="smiley">
            <img
              v-if="fear"
              class="smile-icon"
              src="../src/assets/smiles/fear.webp"
              alt=""
            />
            <img
              v-else
              class="smile-icon"
              :src="`../src/assets/smiles/${smileSatus[gameStatus]}.webp`"
              alt=""
            />
          </div>
        </button>
        <div class="stopwatch" :class="{ thousand: secunds > 999 }">
          <span v-if="secunds < 100">0</span><span v-if="secunds < 10">0</span
          >{{ secunds }}
        </div>
      </div>
      <div class="field" @contextmenu.prevent>
        <button
          v-for="(item, index) in cells"
          :key="index"
          @click="clickCell(index)"
          @mousedown="putUpFlagOrFear(index)"
          class="btn-wrapper"
          :class="{ clicked: item }"
          :disabled="item || gameStatus === 'gameOver' || gameStatus === 'win'"
        >
          <div class="unset">
            <img
              v-if="!item && flags[index] === true"
              src="../src/assets/icons/flag.png"
              alt=""
            />
            <img
              v-else-if="item && cells[index] === 'red'"
              class="redbomb"
              src="../src/assets/icons/bomb_red.png"
              alt=""
            />

            <img
              v-else-if="item && isAmine(index)"
              src="../src/assets/icons/bomb.png"
              alt=""
            />
            <img
              v-else-if="item && cells[index] === 'x'"
              src="../src/assets/icons/bomb_x.png"
              alt=""
            />
            <span
              v-else-if="item && howManyBombs(index) !== 0"
              :style="{ color: DIGITS_COLOR[howManyBombs(index)] }"
            >
              {{ howManyBombs(index) }}</span
            >
            <span v-else-if="!item && flags[index] === '?'">?</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
