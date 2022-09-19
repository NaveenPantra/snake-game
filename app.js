const config = {
  cols: Math.floor((window.innerWidth - 32) / 16),
  rows: Math.floor((window.innerHeight - 32) / 16),
  snakeLen: 10,
  points: 0,
  lives: 0,
  speed: 5,
  snakeBoard: "snk-brd",
  snakeCls: "snk",
  snakeFd: "snk-fd",
  snakePartCls: "snk-prt",
  snakeHeadCls: "snk-hd",
  ptsCount: "pts-count",
  spdCount: "spd-count",
  deadCount: "dead-count",
  startGame: "start-game",
  pauseGame: "pause-game",
  hide: "hide",
  snake: null,
  snakeFood: null,
  pointsCount: null,
  snakeFoodPos: [],
  headPos: { col: 0, row: 0, dir: "up" },
  currentPosSet: new Set(),
  sameDirMap: {
    up: "-1,0",
    down: "1,0",
    left: "0,-1",
    right: "0,1",
  },
  cancelDirMap: {
    up: "ArrowDown",
    down: "ArrowUp",
    left: "ArrowRight",
    right: "ArrowLeft",
  },
  keyCodeToDirMap: {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowRight: "right",
    ArrowLeft: "left",
  },
  posMap: {
    up: {
      "-1,0": "up",
      "0,-1": "left",
      "0,1": "right",
    },
    down: {
      "1,0": "down",
      "0,1": "right",
      "0,-1": "left",
    },
    left: {
      "0,-1": "left",
      "-1,0": "up",
      "1,0": "down",
    },
    right: {
      "0,1": "right",
      "-1,0": "up",
      "1,0": "down",
    },
  },
  speedIntervals: [2, 4, 8, 10, 12],
};

let counter = -1;

let raf = null;

const startGameBtn = document.querySelector(`.${config.startGame}`);
const pauseGameBtn = document.querySelector(`.${config.pauseGame}`);
const snakeBrd = document.querySelector(`.${config.snakeBoard}`);
const pointsCount = document.querySelector(`.${config.ptsCount}`);
const speedCount = document.querySelector(`.${config.spdCount}`);
const deadCount = document.querySelector(`.${config.deadCount}`);

startGameBtn.addEventListener("click", toggleStartGame);
pauseGameBtn.addEventListener("click", toggleStartGame);
document.body.addEventListener("keydown", handleKeyPress);

pointsCount.textContent = config.points;
speedCount.textContent = config.speed;
deadCount.textContent = config.lives;

function placeSnakeFood() {
  const { cols, rows, snakeFood } = config;
  let row = Math.floor(Math.random() * (rows - 10) + 5);
  let col = Math.floor(Math.random() * (cols - 10) + 5);
  config.snakeFoodPos = [row, col];
  snakeFood.style.setProperty("grid-row-start", row);
  snakeFood.style.setProperty("grid-column-start", col);
  snakeFood.setAttribute("data-dr", row);
  snakeFood.setAttribute("data-dc", col);
}

function createSnake() {
  const { snakeCls, snakePartCls, snakeHeadCls } = config;
  const snake = [];

  const snakeFood = document.createElement("div");
  snakeFood.classList.add(config.snakeFd);
  snakeBrd.appendChild(snakeFood);
  config.snakeFood = snakeFood;
  placeSnakeFood();

  const head = document.createElement("div");
  head.classList.add(snakeCls);
  head.classList.add(snakeHeadCls);
  snake.push(head);
  snakeBrd.appendChild(head);
  for (let i = 0; i < config.snakeLen; i++) {
    const div = document.createElement("div");
    div.classList.add(snakeCls);
    div.classList.add(snakePartCls);
    snake.push(div);
    snakeBrd.appendChild(div);
  }
  // snakeBoard.append(snake);
  config.snake = snake;
  return snake;
}

function setup() {
  const { snake } = config;
  snakeBrd.style.setProperty(
    "grid-template-columns",
    `repeat(${config.cols}, 1fr)`
  );
  snakeBrd.style.setProperty(
    "grid-template-rows",
    `repeat(${config.rows}, 1fr)`
  );

  const prev = {};
  prev.col = Math.floor(config.cols / 2);
  prev.row = Math.floor(config.rows / 2);
  config.headPos = { ...config.headPos, ...prev };
  for (const snakePart of snake) {
    snakePart.style.setProperty("grid-row", `${prev.row} / span 1`);
    snakePart.style.setProperty("grid-column", `${prev.col} / span 1`);
    snakePart.setAttribute("data-dr", prev.row);
    snakePart.setAttribute("data-dc", prev.col);
    // add all the current cols and rows.
    config.currentPosSet.add(`${prev.row},${prev.col}`);
    // prev.col += 1;
    prev.row += 1;
  }
}

function handleKeyPress(event) {
  const { headPos, keyCodeToDirMap, cancelDirMap } = config;
  if (event.code === "Space") {
    toggleStartGame();
    return;
  }

  if (!raf) return;

  if (!keyCodeToDirMap[event.code]) return;
  const { dir: currentDir } = headPos;
  if (event.code === cancelDirMap[currentDir]) return;
  headPos.dir = keyCodeToDirMap[event.code];
}

function handleEat() {
  placeSnakeFood();
  config.points += 1;
  pointsCount.textContent = config.points;
  // add one more snake part
  // if (config.points % 2 === 0) {
  const div = document.createElement("div");
  div.classList.add(config.snakeCls);
  div.classList.add(config.snakePartCls);
  config.snake.push(div);
  snakeBrd.appendChild(div);
  // }
  if (config.speed > 1) {
    const pts = config.points;
    if (pts > config.speedIntervals[3]) {
      config.speed = 1;
    } else if (pts > config.speedIntervals[2]) {
      config.speed = 2;
    } else if (pts > config.speedIntervals[1]) {
      config.speed = 3;
    } else if (pts > config.speedIntervals[0]) {
      config.speed = 4;
    }
    speedCount.textContent = config.speed;
  }
}

function getNextHeadOffset() {
  const { headPos, cols, rows, posMap, sameDirMap, currentPosSet } = config;
  const { dir, col, row } = headPos;
  let [nextRow, nextCol] = sameDirMap[dir].split(",").map((n) => parseInt(n));

  nextRow = nextRow + row;
  nextCol = nextCol + col;

  // break
  if (currentPosSet.has(`${nextRow},${nextCol}`)) return;

  if (nextCol > cols) nextCol = 0;
  if (nextCol < 0) nextCol = cols;
  if (nextRow < 0) nextRow = rows;
  if (nextRow > rows) nextRow = 0;

  const nextPos = { row: nextRow, col: nextCol };

  config.headPos = { ...config.headPos, ...nextPos };

  return { ...nextPos };
}

function moveSnake() {
  counter += 1;
  if (counter % config.speed !== 0) {
    raf = requestAnimationFrame(moveSnake);
    return;
  }
  const { snake, snakeFoodPos } = config;
  let nextPos = getNextHeadOffset();
  config.currentPosSet.clear();
  if (!nextPos) {
    cancelAnimationFrame(raf);
    raf = null;
    config.lives += 1;
    deadCount.textContent = config.lives;
    setup();
    raf = requestAnimationFrame(moveSnake);
    return;
  }
  config.currentPosSet.add(`${nextPos.row},${nextPos.col}`);
  let i = 0;
  for (let snakePart of snake) {
    config.currentPosSet.add(`${nextPos.row},${nextPos.col}`);
    const row = parseInt(snakePart.getAttribute("data-dr"));
    const col = parseInt(snakePart.getAttribute("data-dc"));
    snakePart.style.setProperty("grid-row", `${nextPos.row} / span 1`);
    snakePart.style.setProperty("grid-column", `${nextPos.col} / span 1`);
    snakePart.setAttribute("data-dr", nextPos.row);
    snakePart.setAttribute("data-dc", nextPos.col);
    nextPos = { row, col };
    if (
      i === 0 &&
      nextPos.row === snakeFoodPos[0] &&
      nextPos.col === snakeFoodPos[1]
    ) {
      handleEat();
    }
  }
  raf = requestAnimationFrame(moveSnake);
}

function toggleStartGame() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = null;
    startGameBtn.classList.toggle(config.hide);
    pauseGameBtn.classList.toggle(config.hide);
    return;
  }
  raf = requestAnimationFrame(moveSnake);
  startGameBtn.classList.toggle(config.hide);
  pauseGameBtn.classList.toggle(config.hide);
}

createSnake();
setup();
