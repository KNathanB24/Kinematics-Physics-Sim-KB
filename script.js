const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ---------------- UI ----------------
const v0Slider = document.getElementById("v0");
const angleSlider = document.getElementById("angle");
const gSlider = document.getElementById("gSlider");

const v0Label = document.getElementById("v0Label");
const angleLabel = document.getElementById("angleLabel");
const gLabel = document.getElementById("gLabel");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const timeEl = document.getElementById("time");
const heightEl = document.getElementById("height");
const rangeEl = document.getElementById("range");

const xPosEl = document.getElementById("xPos");
const yPosEl = document.getElementById("yPos");

// ---------------- PHYSICS ----------------
let v0 = 80;
let angle = 45;
let g = 9.8;
let h = 0;

// ---------------- STATE ----------------
let t = 0;
let running = false;
let points = [];

let maxHeight = 0;
let finalRange = 0;

// velocity
let vx, vy, theta;

// ---------------- AUTO SCALE ----------------
let maxX = 0;
let maxY = 0;
let scale = 1;

// ---------------- TIME CONTROL ----------------
let timeScale = 0.4;

// ---------------- SETUP ----------------
function setupPhysics() {
    theta = angle * Math.PI / 180;

    vx = v0 * Math.cos(theta);
    vy = v0 * Math.sin(theta);
}

// ---------------- RESET ----------------
function reset() {
    t = 0;
    points = [];
    running = false;

    maxHeight = 0;
    finalRange = 0;

    maxX = 0;
    maxY = 0;

    setupPhysics();
    scale = 1;

    draw();
    updateUI(0, 0);
}

// ---------------- LOOP ----------------
function step() {
    if (!running) return;

    t += 0.05 * timeScale;

    let x = vx * t;
    let y = h + vy * t - 0.5 * g * t * t;

    // track bounds
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;

    let worldWidth = Math.max(maxX, 1);
    let worldHeight = Math.max(maxY, 1);

    let scaleX = canvas.width / (worldWidth * 1.2);
    let scaleY = canvas.height / (worldHeight * 1.2);

    scale = Math.min(scaleX, scaleY);

    if (y < 0) {
        running = false;
        finalRange = x;
        updateUI(x, 0);
        draw();
        return;
    }

    if (y > maxHeight) maxHeight = y;

    points.push({ x, y });

    updateUI(x, y);
    draw();

    requestAnimationFrame(step);
}

// ---------------- UI UPDATE ----------------
function updateUI(currentX = 0, currentY = 0) {
    if (timeEl) timeEl.textContent = t.toFixed(2);
    if (heightEl) heightEl.textContent = maxHeight.toFixed(2);
    if (rangeEl) rangeEl.textContent = finalRange.toFixed(2);

    if (xPosEl) xPosEl.textContent = currentX.toFixed(2);
    if (yPosEl) yPosEl.textContent = Math.max(0, currentY).toFixed(2);

    v0Label.textContent = v0;
    angleLabel.textContent = angle;
    gLabel.textContent = g.toFixed(1);
}

// ---------------- GRID ----------------
function drawGrid() {
    ctx.strokeStyle = "#e6e6e6";

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

// ---------------- AXES WITH NUMBERS ----------------
function drawAxes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.stroke();

    let stepMeters = Math.max(5, Math.round((50 / scale) / 5) * 5);

    for (let x = stepMeters; x < canvas.width / scale; x += stepMeters) {
        let px = x * scale;

        ctx.beginPath();
        ctx.moveTo(px, canvas.height);
        ctx.lineTo(px, canvas.height - 5);
        ctx.stroke();

        ctx.fillText(x.toFixed(0), px - 10, canvas.height - 10);
    }

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

    let angle = Math.atan2(endY - startY, endX - startX);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 8 * Math.cos(angle - 0.3), endY - 8 * Math.sin(angle - 0.3));
    ctx.lineTo(endX - 8 * Math.cos(angle + 0.3), endY - 8 * Math.sin(angle + 0.3));
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
}

// ---------------- DRAW ----------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawAxes();

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

// gravity preset helper (must exist in HTML buttons)
window.setGravityPreset = function(value) {
    g = value;
    gSlider.value = value;
    reset();
};

startBtn.onclick = () => {
    if (!running) {
        running = true;
        step();
    }
};

pauseBtn.onclick = () => {
    running = false;
};

resetBtn.onclick = () => {
    reset();
};

// ---------------- START ----------------
reset();