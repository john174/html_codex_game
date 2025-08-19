// Simple 2D coin collection game using keyboard arrows.
// Sprites from the open source Kenney assets:
// Player: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Blue/alienBlue_stand.png
// Coin: https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/coinGold.png

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const playerImg = new Image();
playerImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Players/Variable%20sizes/Blue/alienBlue_stand.png';

const coinImg = new Image();
coinImg.src = 'https://raw.githubusercontent.com/AGabtni/Kenney-s-World/master/imgs/Items/coinGold.png';

// Game state
const player = {
  x: 50,
  y: 300,
  width: 40,
  height: 40,
  vy: 0,
  onGround: false
};

const gravity = 0.5;
const speed = 3;
const jumpPower = -10;
const ground = 350;
const keys = {};
let coinsCollected = 0;

// Create 30 coins at random positions
const coins = [];
for (let i = 0; i < 30; i++) {
  coins.push({
    x: Math.random() * (canvas.width - 32),
    y: Math.random() * 200 + 100,
    collected: false
  });
}

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

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
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

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
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, ground, canvas.width, 50);

  // Draw player
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Draw coins
  coins.forEach((coin) => {
    if (!coin.collected) {
      ctx.drawImage(coinImg, coin.x, coin.y, 32, 32);
    }
  });

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
    gameLoop();
  };
};
