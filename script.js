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

const npcImg = new Image();
npcImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Green/alienGreen_stand.png';

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

const npc = {
  x: 0,
  y: 290,
  width: 40,
  height: 40,
  vy: 0,
  onGround: false
};

const gravity = 0.5;
const speed = 3;
const npcSpeed = 2.5;
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

  // Reset player and NPC positions
  player.x = 50;
  player.y = ground - player.height;
  player.vy = 0;
  player.onGround = false;
  npc.x = Math.max(0, player.x - 120);
  npc.y = ground - npc.height;
  npc.vy = 0;
  npc.onGround = false;

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

  // NPC horizontal movement chasing the player
  let npcNextX = npc.x;
  if (npc.x < player.x - 40) npcNextX += npcSpeed;
  else if (npc.x > player.x - 40) npcNextX -= npcSpeed;

  obstacles.forEach((ob) => {
    if (
      npcNextX < ob.x + ob.width &&
      npcNextX + npc.width > ob.x &&
      npc.y < ob.y + ob.height &&
      npc.y + npc.height > ob.y
    ) {
      if (npc.x < ob.x) npcNextX = ob.x - npc.width;
      else npcNextX = ob.x + ob.width;
      if (npc.onGround) {
        npc.vy = jumpPower;
        npc.onGround = false;
      }
    } else if (
      npc.onGround &&
      npc.x + npc.width < ob.x &&
      npc.x + npc.width + npcSpeed >= ob.x
    ) {
      npc.vy = jumpPower;
      npc.onGround = false;
    }
  });
  npc.x = npcNextX;

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

  // NPC gravity and vertical collisions
  npc.vy += gravity;
  let npcNextY = npc.y + npc.vy;
  npc.onGround = false;

  obstacles.forEach((ob) => {
    if (
      npc.x < ob.x + ob.width &&
      npc.x + npc.width > ob.x &&
      npcNextY < ob.y + ob.height &&
      npcNextY + npc.height > ob.y
    ) {
      if (npc.vy > 0) {
        npcNextY = ob.y - npc.height;
        npc.vy = 0;
        npc.onGround = true;
      } else if (npc.vy < 0) {
        npcNextY = ob.y + ob.height;
        npc.vy = 0;
      }
    }
  });

  if (npcNextY + npc.height >= ground) {
    npcNextY = ground - npc.height;
    npc.vy = 0;
    npc.onGround = true;
  }

  npc.y = npcNextY;

  // Clamp to canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;
  if (npc.x < 0) npc.x = 0;
  if (npc.x + npc.width > levelWidth) npc.x = levelWidth - npc.width;

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

    // Draw NPC then player
    ctx.drawImage(npcImg, npc.x, npc.y, npc.width, npc.height);
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
  npcImg.onload = () => {
    coinImg.onload = () => {
      groundImg.onload = () => {
        finishImg.onload = () => {
          generateLevel();
          gameLoop();
        };
      };
    };
  };
};
