// ===== Thông tin của Gáp =====
const GAP_BIRTH_YEAR = 1990;
const GAP_AGE = 2026 - GAP_BIRTH_YEAR;

const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d");
const wishModal = document.querySelector("#wishModal");
const openWish = document.querySelector("#openWish");
const closeWish = document.querySelector("#closeWish");
const blowButton = document.querySelector("#blowCandles");
const blowLabel = document.querySelector("#blowLabel");
const cake = document.querySelector("#cake");
const danceReward = document.querySelector("#danceReward");
const artCaption = document.querySelector("#artCaption");
const pardy = document.querySelector("#pardy");
const bubble = document.querySelector("#bubble");
const missionArena = document.querySelector("#missionArena");
const mondayButton = document.querySelector("#mondayButton");
const missionStatus = document.querySelector("#missionStatus");
const stats = document.querySelector("#stats");
const nap = document.querySelector("#nap");
const toast = document.querySelector("#toast");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let particles = [];
let animationFrame;
let toastTimer;
let bubbleTimer;

const colors = ["#ff9a1f", "#ffd15c", "#fff3dc", "#ff6b3d", "#ffb4c2", "#ffe08a"];

/* ---------- Tuổi & dòng thứ Hai ---------- */

document.querySelectorAll("[data-age]").forEach((el) => {
  el.textContent = GAP_AGE ?? "??";
  if (GAP_AGE) el.classList.remove("fill-me");
});

if (new Date().getDay() === 1) {
  document.querySelector("#mondayLine").textContent = "HÔM NAY LÀ THỨ HAI, NHƯNG ĐƯỢC MIỄN GHÉT";
}

/* ---------- Pháo hoa ---------- */

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

class Particle {
  constructor(x, y, color, angle, speed, isPaw = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isPaw = isPaw;
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
    this.gravity = isPaw ? 0.035 : 0.055;
    this.friction = 0.986;
    this.alpha = 1;
    this.decay = isPaw ? 0.008 : 0.009 + Math.random() * 0.008;
    this.size = isPaw ? 14 + Math.random() * 8 : 1.4 + Math.random() * 2.2;
    this.rotation = Math.random() * Math.PI;
    this.trail = [];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 4) this.trail.shift();
    this.velocityX *= this.friction;
    this.velocityY = this.velocityY * this.friction + this.gravity;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.rotation += 0.03;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);

    if (this.isPaw) {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐾", 0, 0);
      ctx.restore();
      return;
    }

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
  for (let i = 0; i < 5; i += 1) {
    particles.push(new Particle(x, y, selected, Math.random() * Math.PI * 2, 1.5 + Math.random() * 3, true));
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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/* ---------- Thổi nến ---------- */

function toggleCandles() {
  const blown = !cake.classList.contains("is-blown");
  cake.classList.toggle("is-blown", blown);
  danceReward.classList.toggle("is-visible", blown);

  if (blown) {
    blowLabel.textContent = "THẮP LẠI NẾN";
    artCaption.textContent = "Điều ước của Gáp đã bay tới vũ trụ lasagna ✨";
    fireworkShow();
    showToast("Chú Gáp đã ước xong! 🎉");
  } else {
    blowLabel.textContent = "THỔI NẾN";
    artCaption.textContent = "Ước đi Gáp, rồi thổi nến!";
  }
}

blowButton.addEventListener("click", toggleCandles);
cake.addEventListener("click", toggleCandles);

/* ---------- Garf nói gì đó về Gáp ---------- */

const quotes = [
  "Gáp thêm 1 tuổi = thêm 1 phần lasagna. Luật rồi.",
  "Tuổi mới của Gáp: ngủ nhiều hơn, ăn ngon hơn, thứ Hai ít hơn.",
  "Hôm nay ai gọi Gáp dậy sớm là bị kick khỏi guild nha.",
  "Gáp không béo, Gáp đang tích năng lượng cho tuổi mới.",
  "CoHonTeam tuyên bố: hôm nay Gáp là boss.",
  "Ước gì cũng được, trừ ước có thêm thứ Hai.",
  "Mèo cam xịn nhất guild? Chú Gáp chứ ai.",
  "GarfXX dùng skill: ĐỚP! Hiệu quả rất cao.",
  "Gáp nhìn bánh lasagna sinh nhật: “Anh thích skin này.”",
];
let lastQuote = -1;

pardy.addEventListener("click", () => {
  let index;
  do {
    index = Math.floor(Math.random() * quotes.length);
  } while (index === lastQuote);
  lastQuote = index;

  bubble.textContent = quotes[index];
  bubble.classList.add("is-visible");
  window.clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => bubble.classList.remove("is-visible"), 3200);
});

/* ---------- Nhiệm vụ phụ: nút thứ Hai chạy trốn ---------- */

const MAX_TRIES = 7;
const missionLines = [
  "Gáp né được rồi 😼",
  "Lại hụt! Mèo cam phản xạ nhanh lắm.",
  "Gáp: “Hôm nay sinh nhật, không dậy.”",
  "Thất bại lần 4. Guild bắt đầu lo lắng.",
  "Gáp đã trùm chăn kín mít.",
  "Còn một cơ hội cuối…",
];
let tries = 0;

function dodge() {
  if (tries >= MAX_TRIES) return;
  tries += 1;

  if (tries >= MAX_TRIES) {
    mondayButton.classList.add("is-tired");
    mondayButton.textContent = "😴 THÔI ĐỂ GÁP NGỦ";
    mondayButton.style.left = "50%";
    mondayButton.style.top = "50%";
    missionStatus.textContent = "Nhiệm vụ thất bại. Sinh nhật mà, cho Gáp ngủ tiếp!";
    return;
  }

  const arena = missionArena.getBoundingClientRect();
  const button = mondayButton.getBoundingClientRect();
  const minX = button.width / 2 + 6;
  const maxX = arena.width - button.width / 2 - 6;
  const minY = button.height / 2 + 6;
  const maxY = arena.height - button.height / 2 - 6;
  const currentX = button.left - arena.left + button.width / 2;
  const currentY = button.top - arena.top + button.height / 2;

  let x;
  let y;
  let attempts = 0;
  do {
    x = minX + Math.random() * Math.max(maxX - minX, 0);
    y = minY + Math.random() * Math.max(maxY - minY, 0);
    attempts += 1;
  } while (Math.hypot(x - currentX, y - currentY) < 60 && attempts < 20);

  mondayButton.style.left = `${x}px`;
  mondayButton.style.top = `${y}px`;
  missionStatus.textContent = missionLines[tries - 1];
}

mondayButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") dodge();
});

mondayButton.addEventListener("click", () => {
  if (tries >= MAX_TRIES) {
    showToast("Gáp: “Zzz… sinh nhật vui vẻ nha anh em…”");
  } else {
    dodge();
  }
});

/* ---------- Thanh chỉ số chạy khi cuộn tới ---------- */

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      stats.classList.add("is-filled");
      observer.disconnect();
    }
  }, { threshold: 0.4 });
  observer.observe(stats);
} else {
  stats.classList.add("is-filled");
}

/* ---------- Thiệp ---------- */

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && wishModal.classList.contains("is-open")) setModal(false);
});

/* ---------- Ngủ trưa khi để yên ---------- */

const NAP_AFTER_MS = 25000;
let napTimer;

function scheduleNap() {
  window.clearTimeout(napTimer);
  napTimer = window.setTimeout(() => {
    if (document.hidden || wishModal.classList.contains("is-open")) {
      scheduleNap();
      return;
    }
    nap.classList.add("is-on");
    nap.setAttribute("aria-hidden", "false");
  }, NAP_AFTER_MS);
}

function wakeUp() {
  if (nap.classList.contains("is-on")) {
    nap.classList.remove("is-on");
    nap.setAttribute("aria-hidden", "true");
  }
  scheduleNap();
}

["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach((type) => {
  window.addEventListener(type, wakeUp, { passive: true });
});
scheduleNap();

/* ---------- Khởi động ---------- */

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

window.addEventListener("load", () => {
  if (reduceMotion) return;
  window.setTimeout(() => {
    createBurst(window.innerWidth * 0.78, window.innerHeight * 0.25, 55);
    createBurst(window.innerWidth * 0.25, window.innerHeight * 0.33, 45);
  }, 650);
});
