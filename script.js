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

// Create 30 coins at random positions
const coins = [];
for (let i = 0; i < 30; i++) {
  coins.push({
    x: Math.random() * (levelWidth - 32),
    y: Math.random() * 200 + 100,
    collected: false
  });
}

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  e.preventDefault();
});

function update() {
  if (keys['ArrowLeft']) player.x -= speed;
  if (keys['ArrowRight']) player.x += speed;

  // Jump
  if (keys['ArrowUp'] && player.onGround) {
    player.vy = jumpPower;
    player.onGround = false;
  }

  // Gravity
  player.vy += gravity;
  player.y += player.vy;

  if (player.y + player.height >= ground) {
    player.y = ground - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // Clamp to canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;

  // Coin collision
  coins.forEach((coin) => {
    if (!coin.collected &&
        player.x < coin.x + 32 &&
        player.x + player.width > coin.x &&
        player.y < coin.y + 32 &&
        player.y + player.height > coin.y) {
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
