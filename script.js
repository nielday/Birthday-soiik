const canvas = document.querySelector("#confetti");
const ctx = canvas.getContext("2d");
const wishModal = document.querySelector("#wishModal");
const openWish = document.querySelector("#openWish");
const closeWish = document.querySelector("#closeWish");
const toRace = document.querySelector("#toRace");
const course = document.querySelector("#course");
const startRace = document.querySelector("#startRace");
const raceStatus = document.querySelector("#raceStatus");
const raceResult = document.querySelector("#raceResult");
const runnerRiku = document.querySelector("#runnerRiku");
const runnerA = document.querySelector("#runnerA");
const runnerB = document.querySelector("#runnerB");
const photo = document.querySelector("#photo");
const bubble = document.querySelector("#bubble");
const pullGacha = document.querySelector("#pullGacha");
const gachaStage = document.querySelector("#gachaStage");
const gachaStatus = document.querySelector("#gachaStatus");
const gachaCount = document.querySelector("#gachaCount");
const stats = document.querySelector("#stats");
const nap = document.querySelector("#nap");
const toast = document.querySelector("#toast");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let particles = [];
let animationFrame;
let toastTimer;
let bubbleTimer;

const colors = ["#ff6fa5", "#ffc53a", "#3d8fe0", "#4fae63", "#ffffff", "#ff9f43"];

/* ---------- Dòng chữ theo thứ trong tuần ---------- */

if (new Date().getDay() === 1) {
  document.querySelector("#dayLine").textContent = "HÔM NAY LÀ THỨ HAI, NHƯNG BANG CHỦ ĐƯỢC NGHỈ";
}

/* ---------- Confetti ---------- */

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

class Particle {
  constructor(x, y, color, angle, speed, isCarrot = false) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isCarrot = isCarrot;
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
    this.gravity = isCarrot ? 0.04 : 0.07;
    this.friction = 0.985;
    this.alpha = 1;
    this.decay = isCarrot ? 0.007 : 0.008 + Math.random() * 0.007;
    this.width = 4 + Math.random() * 5;
    this.height = 7 + Math.random() * 7;
    this.size = 14 + Math.random() * 8;
    this.rotation = Math.random() * Math.PI;
    this.spin = (Math.random() - 0.5) * 0.3;
  }

  update() {
    this.velocityX *= this.friction;
    this.velocityY = this.velocityY * this.friction + this.gravity;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.rotation += this.spin;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.isCarrot) {
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🥕", 0, 0);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    ctx.restore();
  }
}

function createBurst(x, y, count = 70) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
    const speed = 2 + Math.random() * 5.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, color, angle, speed));
  }
  for (let i = 0; i < 5; i += 1) {
    particles.push(new Particle(x, y, "#ff9f43", Math.random() * Math.PI * 2, 1.5 + Math.random() * 3, true));
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

function confettiShow() {
  const positions = [
    [0.2, 0.3],
    [0.5, 0.2],
    [0.8, 0.32],
    [0.34, 0.5],
    [0.68, 0.48],
  ];

  positions.forEach(([x, y], index) => {
    window.setTimeout(() => createBurst(window.innerWidth * x, window.innerHeight * y), index * 220);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

/* ---------- Cuộc đua: bang chủ luôn về nhất ---------- */

const RACE_MS = 2600;
let racing = false;

function resetRace() {
  [runnerRiku, runnerA, runnerB].forEach((runner) => {
    runner.style.transition = "none";
    runner.style.left = "";
  });
  course.classList.remove("is-racing");
  raceResult.classList.remove("is-visible");
  raceResult.setAttribute("aria-hidden", "true");
  // ép trình duyệt vẽ lại trước khi bật transition
  void course.offsetWidth;
  [runnerRiku, runnerA, runnerB].forEach((runner) => {
    runner.style.transition = "";
  });
}

function runRace() {
  if (racing) return;
  racing = true;
  resetRace();

  startRace.disabled = true;
  startRace.textContent = "🏃 ĐANG CHẠY…";
  raceStatus.textContent = "Cổng mở! Bang chủ bứt tốc ngay từ khúc cua đầu tiên…";
  course.classList.add("is-racing");

  const finish = course.clientWidth - 110;
  runnerRiku.style.transitionDuration = `${RACE_MS}ms`;
  runnerA.style.transitionDuration = `${RACE_MS + 700}ms`;
  runnerB.style.transitionDuration = `${RACE_MS + 1100}ms`;

  window.requestAnimationFrame(() => {
    runnerRiku.style.left = `${finish}px`;
    runnerA.style.left = `${finish - 40}px`;
    runnerB.style.left = `${finish - 80}px`;
  });

  window.setTimeout(() => {
    course.classList.remove("is-racing");
    raceResult.classList.add("is-visible");
    raceResult.setAttribute("aria-hidden", "false");
    raceStatus.textContent = "Về nhất! Deadline với Thứ Hai còn đang thở dốc phía sau.";
    startRace.disabled = false;
    startRace.textContent = "🔁 ĐUA LẠI";
    racing = false;
    confettiShow();
    showToast("1着 — Chúc mừng sinh nhật bang chủ! 🎉");
  }, RACE_MS + 120);
}

startRace.addEventListener("click", runRace);

toRace.addEventListener("click", () => {
  document.querySelector("#race").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  window.setTimeout(runRace, reduceMotion ? 0 : 600);
});

/* ---------- Bong bóng thoại ---------- */

const quotes = [
  "Bang chủ hôm nay chạy đường nào cũng về nhất.",
  "Tỉ lệ SSR hôm nay: 100%, riêng cho Riku-san.",
  "Trainer ơi, thêm một tuổi là thêm một kỹ năng mới đó!",
  "CoHonCave tuyên bố: hôm nay cả guild nghỉ cày, đi ăn sinh nhật.",
  "Stamina có thể hết, chứ niềm vui của bang chủ thì không.",
  "Deadline đuổi hoài không kịp bang chủ đâu.",
  "Chúc chị tuổi mới luôn đứng trên bục nhận cúp 🏆",
  "“Hello anh em, lại là Riku đây” — câu quen thuộc nhất CoHonCave.",
];
let lastQuote = -1;

photo.addEventListener("click", () => {
  let index;
  do {
    index = Math.floor(Math.random() * quotes.length);
  } while (index === lastQuote);
  lastQuote = index;

  bubble.textContent = quotes[index];
  bubble.classList.add("is-visible");
  window.clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => bubble.classList.remove("is-visible"), 3400);
});

/* ---------- Gacha: lúc nào cũng nổ SSR ---------- */

const gachaLines = [
  "SSR ★★★ — BANG CHỦ RIKU SAN! Cả guild hú hét.",
  "Lại SSR nữa! Nhân phẩm ngày sinh nhật là có thật.",
  "SSR ★★★ — thẻ ước về tay, khỏi cần quay lại.",
  "Thêm một SSR nữa. Trainer khác nhìn mà ganh tị.",
  "SSR ★★★ — hôm nay bang chủ quay gì cũng trúng.",
];
let pulls = 0;

pullGacha.addEventListener("click", () => {
  if (pullGacha.disabled) return;
  pulls += 1;
  pullGacha.disabled = true;
  gachaStage.classList.remove("is-revealed");
  gachaStatus.textContent = "Đang quay…";

  window.setTimeout(() => {
    gachaStage.classList.add("is-revealed");
    gachaStatus.textContent = gachaLines[(pulls - 1) % gachaLines.length];
    gachaCount.textContent = `Đã quay: ${pulls} lần`;
    pullGacha.textContent = "🎟️ QUAY TIẾP";
    pullGacha.disabled = false;
    createBurst(window.innerWidth * 0.7, window.innerHeight * 0.45, 50);
  }, reduceMotion ? 50 : 700);
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

/* ---------- Thư chúc ---------- */

function setModal(open) {
  wishModal.classList.toggle("is-open", open);
  wishModal.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    closeWish.focus();
    confettiShow();
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

/* ---------- Nghỉ giữa hiệp khi để yên ---------- */

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
    createBurst(window.innerWidth * 0.75, window.innerHeight * 0.28, 55);
    createBurst(window.innerWidth * 0.26, window.innerHeight * 0.34, 45);
  }, 600);
});
