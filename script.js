const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ---------------- UI ----------------
const v0Slider = document.getElementById("v0");
const angleSlider = document.getElementById("angle");
const gSlider = document.getElementById("gSlider");
const massSlider = document.getElementById("massSlider");

const v0Label = document.getElementById("v0Label");
const angleLabel = document.getElementById("angleLabel");
const gLabel = document.getElementById("gLabel");
const massLabel = document.getElementById("massLabel");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const timeEl = document.getElementById("time");
const heightEl = document.getElementById("height");
const rangeEl = document.getElementById("range");

const xPosEl = document.getElementById("xPos");
const yPosEl = document.getElementById("yPos");

// ---------------- ENERGY UI ----------------
const keValue = document.getElementById("keValue");
const peValue = document.getElementById("peValue");
const teValue = document.getElementById("teValue");

const keBar = document.getElementById("keBar");
const peBar = document.getElementById("peBar");
const teBar = document.getElementById("teBar");

// ---------------- INSTRUCTIONS TOGGLE ----------------
const instructions = document.getElementById("instructions");
const instructionsHeader = document.getElementById("instructionsHeader");

// start CLOSED
instructions.classList.add("collapsed");

instructionsHeader.onclick = () => {
    instructions.classList.toggle("collapsed");
};

// ---------------- PHYSICS ----------------
let v0 = 80;
let angle = 45;
let g = 9.8;
let h = 0;
let mass = 1.0;

// ---------------- STATE ----------------
let t = 0;
let running = false;
let points = [];

let maxHeight = 0;
let finalRange = 0;

// velocity
let vx, vy, theta;

// exact landing time
let flightTime = 0;

// ---------------- AUTO SCALE ----------------
let maxX = 0;
let maxY = 0;
let scale = 1;

// ---------------- TIME CONTROL ----------------
let timeScale = 0.4;

// ---------------- ENERGY ----------------
let initialTotalEnergy = 1;

// ---------------- ANIMATION ID ----------------
let animationId = null;

// ---------------- SETUP ----------------
function setupPhysics() {
    theta = angle * Math.PI / 180;

    vx = v0 * Math.cos(theta);
    vy = v0 * Math.sin(theta);

    initialTotalEnergy =
        0.5 * mass * (vx * vx + vy * vy) + mass * g * h;

    // exact total flight time for y(t) = h + vy*t - 0.5*g*t^2 = 0
    // positive root only
    flightTime = (vy + Math.sqrt(vy * vy + 2 * g * h)) / g;
}

// ---------------- RESET ----------------
function reset() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    t = 0;
    points = [];
    running = false;

    maxHeight = 0;
    finalRange = 0;

    maxX = 0;
    maxY = 0;

    setupPhysics();
    scale = 1;

    // start the path at the launch point so the graph is never blank
    points.push({ x: 0, y: h });

    updateEnergy(0, h);
    draw();
    updateUI(0, h);
}

// ---------------- LOOP ----------------
function step() {
    if (!running) return;

    let dt = 0.05 * timeScale;
    let nextT = t + dt;

    // If the next frame would pass the ground, snap to the exact landing time.
    if (nextT >= flightTime) {
        t = flightTime;

        let x = vx * t;
        let y = 0;

        running = false;
        finalRange = x;

        points.push({ x, y });

        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxHeight = Math.max(maxHeight, y);

        updateEnergy(x, y);
        updateUI(x, y);
        draw();

        return;
    }

    t = nextT;

    // REAL physics position
    let x = vx * t;
    let y = h + vy * t - 0.5 * g * t * t;

    // DISPLAY only
    let displayY = Math.max(0, y);

    // track bounds (physics-based)
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;

    if (y > maxHeight) maxHeight = y;

    let worldWidth = Math.max(maxX, 1);
    let worldHeight = Math.max(maxY, 1);

    let scaleX = canvas.width / (worldWidth * 1.2);
    let scaleY = canvas.height / (worldHeight * 1.2);

    scale = Math.min(scaleX, scaleY);

    points.push({ x, y });

    updateEnergy(x, y);
    updateUI(x, displayY);
    draw();

    animationId = requestAnimationFrame(step);
}

// ---------------- ENERGY SYSTEM ----------------
function updateEnergy(x, y) {
    // exact analytic velocity at time t
    let vx_current = vx;
    let vy_current = vy - g * t;

    let speedSquared =
        vx_current * vx_current +
        vy_current * vy_current;

    let KE = 0.5 * mass * speedSquared;
    let PE = mass * g * y;
    let TE = KE + PE;

    keValue.textContent = KE.toFixed(1);
    peValue.textContent = PE.toFixed(1);
    teValue.textContent = TE.toFixed(1);

    let kePercent = (KE / initialTotalEnergy) * 100;
    let pePercent = (PE / initialTotalEnergy) * 100;
    let tePercent = (TE / initialTotalEnergy) * 100;

    keBar.style.width = Math.min(100, Math.max(0, kePercent)) + "%";
    peBar.style.width = Math.min(100, Math.max(0, pePercent)) + "%";
    teBar.style.width = Math.min(100, Math.max(0, tePercent)) + "%";
}

// ---------------- UI UPDATE ----------------
function updateUI(currentX = 0, currentY = 0) {
    timeEl.textContent = t.toFixed(2);
    heightEl.textContent = maxHeight.toFixed(2);
    rangeEl.textContent = finalRange.toFixed(2);

    xPosEl.textContent = currentX.toFixed(2);
    yPosEl.textContent = Math.max(0, currentY).toFixed(2);

    v0Label.textContent = v0;
    angleLabel.textContent = angle;
    gLabel.textContent = g.toFixed(1);
    massLabel.textContent = mass.toFixed(1);
}

// ---------------- GRID ----------------
function drawGrid() {
    ctx.strokeStyle = "#e6e6e6";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// ---------------- AXES ----------------
function drawAxes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";

    // x-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    // y-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.stroke();

    let stepMeters = Math.max(5, Math.round((50 / scale) / 5) * 5);

    // x ticks
    for (let x = stepMeters; x < canvas.width / scale; x += stepMeters) {
        let px = x * scale;

        ctx.beginPath();
        ctx.moveTo(px, canvas.height);
        ctx.lineTo(px, canvas.height - 5);
        ctx.stroke();

        ctx.fillText(x.toFixed(0), px - 10, canvas.height - 10);
    }

    // y ticks
    for (let y = stepMeters; y < canvas.height / scale; y += stepMeters) {
        let py = canvas.height - y * scale;

        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(5, py);
        ctx.stroke();

        ctx.fillText(y.toFixed(0), 5, py + 4);
    }

    ctx.fillText("x (m)", canvas.width - 40, canvas.height - 10);
    ctx.fillText("y (m)", 10, 15);
}

// ---------------- VELOCITY VECTOR ----------------
function drawVelocityVector(x, y) {
    let vx_current = vx;
    let vy_current = vy - g * t;

    let arrowScale = 0.5;

    let dx = vx_current * arrowScale;
    let dy = vy_current * arrowScale;

    let startX = x * scale;
    let startY = canvas.height - y * scale;

    let endX = (x + dx) * scale;
    let endY = canvas.height - (y + dy) * scale;

    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    let arrowAngle = Math.atan2(endY - startY, endX - startX);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - 8 * Math.cos(arrowAngle - 0.3),
        endY - 8 * Math.sin(arrowAngle - 0.3)
    );
    ctx.lineTo(
        endX - 8 * Math.cos(arrowAngle + 0.3),
        endY - 8 * Math.sin(arrowAngle + 0.3)
    );
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
}

// ---------------- DRAW ----------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawAxes();

    // trajectory
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
        let px = points[i].x * scale;
        let py = canvas.height - points[i].y * scale;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.stroke();

    // projectile marker
    if (points.length > 0) {
        let last = points[points.length - 1];

        let px = last.x * scale;
        let py = canvas.height - last.y * scale;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        drawVelocityVector(last.x, last.y);
    }
}

// ---------------- CONTROLS ----------------
v0Slider.addEventListener("input", () => {
    v0 = Number(v0Slider.value);
    reset();
});

angleSlider.addEventListener("input", () => {
    angle = Number(angleSlider.value);
    reset();
});

gSlider.addEventListener("input", () => {
    g = Number(gSlider.value);
    reset();
});

massSlider.addEventListener("input", () => {
    mass = Number(massSlider.value);
    reset();
});

window.setGravityPreset = function(value) {
    g = Number(value);
    gSlider.value = value;
    reset();
};

startBtn.onclick = () => {
    if (!running) {
        running = true;
        animationId = requestAnimationFrame(step);
    }
};

pauseBtn.onclick = () => {
    running = false;
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
};

resetBtn.onclick = () => {
    reset();
};

// ---------------- START ----------------
reset();