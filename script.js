// Simple 2D coin collection game using keyboard arrows.
// Sprites from the open source Kenney assets:
// Player: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Blue/alienBlue_stand.png
// Coin: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/coinGold.png
// Ground tile: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Ground/Grass/grassMid.png

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Level settings
const levelWidth = 2000;
let cameraX = 0;

// Load images
const playerImg = new Image();
playerImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Blue/alienBlue_stand.png';

const coinImg = new Image();
coinImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/coinGold.png';

const groundImg = new Image();
groundImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Ground/Grass/grassMid.png';

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
const groundTileHeight = 70;
const ground = canvas.height - groundTileHeight;
const keys = {};
let coinsCollected = 0;

// Simple platforms/obstacles to jump over or onto
const obstacles = [
  { x: 300, y: ground - 40, width: 100, height: 40 },
  { x: 700, y: ground - 80, width: 80, height: 80 },
  { x: 1100, y: ground - 40, width: 40, height: 40 },
  { x: 1400, y: ground - 120, width: 100, height: 20 },
  { x: 1700, y: ground - 60, width: 120, height: 60 }
];

// Place 30 coins, some atop the obstacles
const coins = [];
for (let i = 0; i < 20; i++) {
  coins.push({
    x: 100 + i * 80,
    y: ground - 80,
    collected: false
  });
}

const extraCoins = [
  { x: obstacles[0].x + obstacles[0].width / 2 - 16, y: obstacles[0].y - 40 },
  { x: obstacles[1].x + obstacles[1].width / 2 - 16, y: obstacles[1].y - 40 },
  { x: obstacles[1].x + obstacles[1].width / 2 - 16, y: obstacles[1].y - 80 },
  { x: obstacles[2].x + obstacles[2].width / 2 - 16, y: obstacles[2].y - 40 },
  { x: obstacles[3].x + obstacles[3].width / 2 - 16, y: obstacles[3].y - 40 },
  { x: obstacles[3].x + obstacles[3].width / 2 - 16, y: obstacles[3].y - 80 },
  { x: obstacles[4].x + obstacles[4].width / 2 - 16, y: obstacles[4].y - 40 },
  { x: obstacles[4].x + obstacles[4].width / 2 - 16, y: obstacles[4].y - 80 },
  { x: 1800, y: 150 },
  { x: 1900, y: 150 }
];
extraCoins.forEach((c) => coins.push({ ...c, collected: false }));

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  e.preventDefault();
});

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

  if (coinsCollected >= 30) {
    ctx.fillText('You collected all the coins!', 250, 200);
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
      gameLoop();
    };
  };
};
