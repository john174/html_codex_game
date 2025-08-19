// Simple 2D coin collection game using keyboard arrows.
// Sprites from the open source Kenney assets:
// Player: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Blue/alienBlue_stand.png
// Coin: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/coinGold.png
// Ground tile: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Ground/Grass/grassMid.png
// Finish flag: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/flagGreen1.png

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Level settings
const levelWidth = 3000;
let cameraX = 0;

// Load images
const playerImg = new Image();
playerImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Blue/alienBlue_stand.png';

const coinImg = new Image();
coinImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/coinGold.png';

const groundImg = new Image();
groundImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Ground/Grass/grassMid.png';

const finishImg = new Image();
finishImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/flagGreen1.png';

// Game state
const player = {
  x: 50,
  y: 290,
  width: 40,
  height: 40,
  vy: 0,
  onGround: false
};

const gravity = 0.5;
const speed = 3;
const jumpPower = -10;
const jumpHeight = (jumpPower * jumpPower) / (2 * gravity);
const groundTileHeight = 70;
const ground = canvas.height - groundTileHeight;
const keys = {};
let coinsCollected = 0;

const obstacles = [];
const coins = [];
let finish;

const numCoins = 30;
const numObstacles = 8;
const coinSize = 32;
const minCoinSpacing = coinSize * 2.5; // prevent coins from clustering

// Coins should remain within jump reach
const minCoinY = ground - player.height - jumpHeight - coinSize;
const maxCoinY = ground - 80;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function isCoinTooClose(x, y) {
  return coins.some((c) => Math.hypot(c.x - x, c.y - y) < minCoinSpacing);
}

function generateLevel() {
  obstacles.length = 0;
  coins.length = 0;

  // Generate obstacles spread across the level
  for (let i = 0; i < numObstacles; i++) {
    const segmentStart = (i * levelWidth) / numObstacles + 100;
    const segmentEnd = ((i + 1) * levelWidth) / numObstacles - 100;
    const width = randomRange(60, 120);
    const height = randomRange(20, 60);
    const x = randomRange(segmentStart, segmentEnd - width);
    const y = ground - height;
    obstacles.push({ x, y, width, height });

    // Place a coin above the obstacle if room allows
    const coinX = x + width / 2 - coinSize / 2;
    const coinY = Math.max(minCoinY, y - 40);
    if (!isCoinTooClose(coinX, coinY)) {
      coins.push({ x: coinX, y: coinY, collected: false });
    }
  }

  // Random coins throughout the level
  while (coins.length < numCoins) {
    const coinX = randomRange(50, levelWidth - 50);
    const coinY = randomRange(minCoinY, maxCoinY);
    const collides = obstacles.some(
      (ob) =>
        coinX < ob.x + ob.width &&
        coinX + coinSize > ob.x &&
        coinY < ob.y + ob.height &&
        coinY + coinSize > ob.y
    );
    if (!collides && !isCoinTooClose(coinX, coinY)) {
      coins.push({ x: coinX, y: coinY, collected: false });
    }
  }

  // Finish flag near the end
  finish = { x: levelWidth - 80, y: ground - 80, width: 40, height: 80 };
}

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  e.preventDefault();
});

let gameWon = false;

function update() {
  let nextX = player.x;
  if (keys['ArrowLeft']) nextX -= speed;
  if (keys['ArrowRight']) nextX += speed;

  // Horizontal collisions with obstacles
  obstacles.forEach((ob) => {
    if (
      nextX < ob.x + ob.width &&
      nextX + player.width > ob.x &&
      player.y < ob.y + ob.height &&
      player.y + player.height > ob.y
    ) {
      if (keys['ArrowLeft']) nextX = ob.x + ob.width;
      else if (keys['ArrowRight']) nextX = ob.x - player.width;
    }
  });
  player.x = nextX;

  // Jump
  if (keys['ArrowUp'] && player.onGround) {
    player.vy = jumpPower;
    player.onGround = false;
  }

  // Gravity
  player.vy += gravity;
  let nextY = player.y + player.vy;
  player.onGround = false;

  // Vertical collisions with obstacles
  obstacles.forEach((ob) => {
    if (
      player.x < ob.x + ob.width &&
      player.x + player.width > ob.x &&
      nextY < ob.y + ob.height &&
      nextY + player.height > ob.y
    ) {
      if (player.vy > 0) {
        nextY = ob.y - player.height;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        nextY = ob.y + ob.height;
        player.vy = 0;
      }
    }
  });

  if (nextY + player.height >= ground) {
    nextY = ground - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  player.y = nextY;

  // Clamp to canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;

  // Coin collision
  coins.forEach((coin) => {
    if (
      !coin.collected &&
      player.x < coin.x + 32 &&
      player.x + player.width > coin.x &&
      player.y < coin.y + 32 &&
      player.y + player.height > coin.y
    ) {
      coin.collected = true;
      coinsCollected++;
    }
  });

  // Finish collision
  if (
    coinsCollected >= numCoins &&
    player.x < finish.x + finish.width &&
    player.x + player.width > finish.x &&
    player.y < finish.y + finish.height &&
    player.y + player.height > finish.y
  ) {
    gameWon = true;
  }

  // Update camera position
  cameraX = Math.max(0, Math.min(player.x - canvas.width / 2, levelWidth - canvas.width));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-cameraX, 0);

  // Draw ground using tiles
  for (let x = 0; x < levelWidth; x += 70) {
    ctx.drawImage(groundImg, x, ground, 70, groundTileHeight);
  }

  // Draw obstacles/platforms
  obstacles.forEach((ob) => {
    ctx.drawImage(groundImg, ob.x, ob.y, ob.width, ob.height);
  });

  // Draw finish flag
  ctx.drawImage(finishImg, finish.x, finish.y, finish.width, finish.height);

  // Draw player
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Draw coins
  coins.forEach((coin) => {
    if (!coin.collected) {
      ctx.drawImage(coinImg, coin.x, coin.y, 32, 32);
    }
  });

  ctx.restore();

  // Draw HUD
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Coins: ${coinsCollected}/30`, 10, 20);

  if (gameWon) {
    ctx.fillText('You reached the finish!', 250, 200);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start when images are loaded
playerImg.onload = () => {
  coinImg.onload = () => {
    groundImg.onload = () => {
      finishImg.onload = () => {
        generateLevel();
        gameLoop();
      };
    };
  };
};
