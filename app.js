const config = {
  cols: 100,
  rows: 100,
  snakeLen: 5,
  snakeBoard: "snk-brd",
  snakeCls: "snk",
  snakePartCls: "snk-prt",
  snakeHeadCls: "snk-hd",
  snake: null,
  headPos: { col: 0, row: 0, dir: "up" },
  currentPosSet: new Set(),
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
};

const snakeBrd = document.querySelector(`.${config.snakeBoard}`);

function createSnake() {
  const { snakeCls, snakePartCls, snakeHeadCls } = config;
  const snake = [];
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
  switch (event.code) {
    // up
    case 38: {
      config.headPos.dir = "up";
      return;
    }
    // right
    case 39: {
      config.headPos.dir = "right";
      return;
    }
    // down
    case 40: {
      config.headPos.dir = "down";
      return;
    }
    // left
    case 37: {
      config.headPos.dir = "left";
      return;
    }
  }
}

function getNextHeadOffset() {
  const { headPos, cols, rows, posMap } = config;
  const { dir, col, row } = headPos;
  let possiblePos = config.posMap[dir];
  possiblePos = Object.keys(possiblePos).map((pos) =>
    pos.split(",").map((n) => parseInt(n))
  );

  possiblePos = possiblePos.filter((pos) => {
    const nextRow = pos[0] + row;
    const nextCol = pos[1] + col;
    return !config.currentPosSet.has(`${nextRow},${nextCol}`);
  });

  if (!possiblePos.length) {
    return;
  }

  let [nextRow, nextCol] = possiblePos.at(
    Math.floor(Math.random() * possiblePos.length)
  );

  const nextDir = posMap[dir][[nextRow, nextCol].join()];
  nextRow = nextRow + row;
  nextCol = nextCol + col;

  if (nextCol > cols) nextCol = 0;
  if (nextCol < 0) nextCol = cols - 1;
  if (nextRow < 0) nextRow = rows - 1;
  if (nextRow > rows) nextRow = 0;

  const nextPos = { row: nextRow, col: nextCol, dir: nextDir };

  config.headPos = { ...config.headPos, ...nextPos };

  return { ...nextPos };
}

function moveSnake() {
  counter += 1;
  if (counter % 4 !== 0) {
    raf = requestAnimationFrame(moveSnake);
    return;
  }
  const { snake } = config;
  let nextPos = getNextHeadOffset();
  config.currentPosSet.clear();
  if (!nextPos) {
    cancelAnimationFrame(raf);
    setup();
    raf = requestAnimationFrame(moveSnake);
    return;
  }
  config.currentPosSet.add(`${nextPos.row},${nextPos.col}`);
  for (let snakePart of snake) {
    config.currentPosSet.add(`${nextPos.row},${nextPos.col}`);
    const row = parseInt(snakePart.getAttribute("data-dr"));
    const col = parseInt(snakePart.getAttribute("data-dc"));
    snakePart.style.setProperty("grid-row", `${nextPos.row} / span 1`);
    snakePart.style.setProperty("grid-column", `${nextPos.col} / span 1`);
    snakePart.setAttribute("data-dr", nextPos.row);
    snakePart.setAttribute("data-dc", nextPos.col);
    nextPos = { row, col };
  }
  raf = requestAnimationFrame(moveSnake);
}

createSnake();
setup();

let counter = -1;

let raf = requestAnimationFrame(moveSnake);
