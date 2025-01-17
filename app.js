const grid = document.querySelector(".grid");
const resultDisplay = document.querySelector(".results");
let currentShooterIndex = 202;
const width = 15;
const aliensRemoved = [];
let invadersId;
let isGoingRight = true;
let direction = 1;
let results = 0;
let level = 1;

const enemyTypes = [
  { className: "invader", health: 1, speed: 600, movementPattern: "straight" },
  {
    className: "zigzag-invader",
    health: 1,
    speed: 500,
    movementPattern: "zigzag",
  },
];
const bossEnemy = {
  className: "boss",
  health: 5,
  speed: 400,
  movementPattern: "zigzag",
};

for (let i = 0; i < width * width; i++) {
  const square = document.createElement("div");
  grid.appendChild(square);
}

const squares = Array.from(document.querySelectorAll(".grid div"));

let alienInvaders = Array.from({ length: 30 }, (_, i) => i);

function draw(aliens) {
  aliens.forEach((alien) => {
    if (!aliensRemoved.includes(alien.index)) {
      squares[alien.index].classList.add(alien.type.className);
    }
  });
}

function remove(aliens) {
  aliens.forEach((alien) => {
    squares[alien.index].classList.remove(alien.type.className);
  });
}

function initializeEnemies() {
  return alienInvaders.map((index) => ({
    index,
    type: enemyTypes[level - 1] || enemyTypes[0],
    health: (enemyTypes[level - 1] || enemyTypes[0]).health,
  }));
}

let enemies = initializeEnemies();

squares[currentShooterIndex].classList.add("shooter");

function moveShooter(e) {
  squares[currentShooterIndex].classList.remove("shooter");
  switch (e.key) {
    case "ArrowLeft":
      if (currentShooterIndex % width !== 0) currentShooterIndex -= 1;
      break;
    case "ArrowRight":
      if (currentShooterIndex % width < width - 1) currentShooterIndex += 1;
      break;
  }
  squares[currentShooterIndex].classList.add("shooter");
}

document.addEventListener("keydown", moveShooter);

function moveInvaders() {
  const leftEdge = enemies[0].index % width === 0;
  const rightEdge = enemies[enemies.length - 1].index % width === width - 1;

  remove(enemies);

  if (rightEdge && isGoingRight) {
    enemies.forEach((alien) => (alien.index += width + 1));
    direction = -1;
    isGoingRight = false;
  }

  if (leftEdge && !isGoingRight) {
    enemies.forEach((alien) => (alien.index += width - 1));
    direction = 1;
    isGoingRight = true;
  }

  enemies.forEach((alien) => (alien.index += direction));
  draw(enemies);

  if (enemies.some((alien) => alien.index === currentShooterIndex)) {
    resultDisplay.innerHTML = "GAME OVER";
    clearInterval(invadersId);
  }

  if (aliensRemoved.length === alienInvaders.length) {
    if (level === 3) {
      resultDisplay.innerHTML = "YOU WIN!";
      clearInterval(invadersId);
    } else {
      level++;
      startNextLevel();
    }
  }
}

function startNextLevel() {
  clearInterval(invadersId);
  resultDisplay.innerHTML = `Level ${level}`;
  alienInvaders = Array.from({ length: 30 }, (_, i) => i);
  enemies = initializeEnemies();
  draw(enemies);
  invadersId = setInterval(moveInvaders, enemies[0].type.speed);
}

function spawnBoss() {
  const boss = {
    index: Math.floor(width / 2),
    type: bossEnemy,
    health: bossEnemy.health,
  };
  enemies = [boss];
  draw(enemies);
  invadersId = setInterval(() => {
    remove(enemies);
    enemies[0].index += Math.random() > 0.5 ? 1 : -1; 
    draw(enemies);
    if (enemies[0].health <= 0) {
      resultDisplay.innerHTML = "YOU WIN!";
      clearInterval(invadersId);
    }
  }, boss.type.speed);
}

function shoot(e) {
  let laserId;
  let currentLaserIndex = currentShooterIndex;

  function moveLaser() {
    squares[currentLaserIndex].classList.remove("laser");
    currentLaserIndex -= width;
    squares[currentLaserIndex].classList.add("laser");

    const hitEnemy = enemies.find((alien) => alien.index === currentLaserIndex);
    if (hitEnemy) {
      squares[currentLaserIndex].classList.remove("laser");
      squares[currentLaserIndex].classList.remove(hitEnemy.type.className);
      squares[currentLaserIndex].classList.add("boom");

      setTimeout(
        () => squares[currentLaserIndex].classList.remove("boom"),
        300
      );
      clearInterval(laserId);

      hitEnemy.health--;
      if (hitEnemy.health <= 0) {
        aliensRemoved.push(hitEnemy.index);
        results++;
        resultDisplay.innerHTML = results;
      }
    }
  }

  if (e.key === "ArrowUp") {
    laserId = setInterval(moveLaser, 100);
  }
}

document.addEventListener("keydown", shoot);

draw(enemies);
invadersId = setInterval(moveInvaders, enemies[0].type.speed);
