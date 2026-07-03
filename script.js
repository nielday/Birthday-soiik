const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d");
const wishModal = document.querySelector("#wishModal");
const openWish = document.querySelector("#openWish");
const closeWish = document.querySelector("#closeWish");
const launchButton = document.querySelector("#launchFireworks");
const toast = document.querySelector("#toast");

let particles = [];
let animationFrame;
let toastTimer;

const colors = ["#ffc85c", "#ff814a", "#ff4f9b", "#8b5cf6", "#67e8f9", "#fff4d6"];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

class Particle {
  constructor(x, y, color, angle, speed) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
    this.gravity = 0.055;
    this.friction = 0.986;
    this.alpha = 1;
    this.decay = 0.009 + Math.random() * 0.008;
    this.size = 1.4 + Math.random() * 2.2;
    this.trail = [];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 4) this.trail.shift();
    this.velocityX *= this.friction;
    this.velocityY = this.velocityY * this.friction + this.gravity;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    const start = this.trail[0] || this;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function createBurst(x, y, count = 72) {
  const selected = colors[Math.floor(Math.random() * colors.length)];
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.09;
    const speed = 2.2 + Math.random() * 5.2;
    const color = Math.random() > 0.76 ? colors[Math.floor(Math.random() * colors.length)] : selected;
    particles.push(new Particle(x, y, color, angle, speed));
  }
  animateParticles();
}

function animateParticles() {
  if (animationFrame) return;

  const animate = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter((particle) => particle.alpha > 0);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    if (particles.length) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      animationFrame = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  animationFrame = requestAnimationFrame(animate);
}

function fireworkShow() {
  const positions = [
    [0.2, 0.28],
    [0.5, 0.2],
    [0.78, 0.31],
    [0.34, 0.48],
    [0.68, 0.5],
  ];

  positions.forEach(([x, y], index) => {
    window.setTimeout(() => createBurst(window.innerWidth * x, window.innerHeight * y), index * 240);
  });
}

function showToast() {
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function setModal(open) {
  wishModal.classList.toggle("is-open", open);
  wishModal.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    closeWish.focus();
    fireworkShow();
  } else {
    openWish.focus();
  }
}

openWish.addEventListener("click", () => setModal(true));
closeWish.addEventListener("click", () => setModal(false));
wishModal.querySelector(".wish-modal__backdrop").addEventListener("click", () => setModal(false));
launchButton.addEventListener("click", () => {
  fireworkShow();
  showToast();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && wishModal.classList.contains("is-open")) setModal(false);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("load", () => {
  window.setTimeout(() => {
    createBurst(window.innerWidth * 0.78, window.innerHeight * 0.25, 55);
    createBurst(window.innerWidth * 0.25, window.innerHeight * 0.33, 45);
  }, 650);
});
