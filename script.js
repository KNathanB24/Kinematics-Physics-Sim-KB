const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Physics
let v0 = 80;
let angle = 45;
let g = 9.8;
let h = 0;

// Time/state
let t = 0;
let running = true;
let points = [];

// Velocity
let vx, vy, theta;

// Scale (set in reset)
let scale;

// ---------- RESET ----------
function reset() {
    t = 0;
    points = [];
    running = true;

    theta = angle * Math.PI / 180;

    vx = v0 * Math.cos(theta);
    vy = v0 * Math.sin(theta);

    let range = (v0 * v0 * Math.sin(2 * theta)) / g;
    scale = canvas.width / (range * 1.2);
}

// ---------- UPDATE ----------
function step() {
    if (!running) return;

    t += 0.05;

    let x = vx * t;
    let y = h + vy * t - 0.5 * g * t * t;

    if (y < 0) {
        running = false;
        draw();
        return;
    }

    points.push({ x, y });

    draw();
    requestAnimationFrame(step);
}

// ---------- DRAW GRID ----------
function drawGrid() {
    ctx.strokeStyle = "#e6e6e6";
    ctx.lineWidth = 1;

    let step = 40;

    // vertical lines
    for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // horizontal lines
    for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// ---------- DRAW AXES ----------
function drawAxes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // x-axis (ground)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    // y-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // labels
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";

    ctx.fillText("x (distance)", canvas.width - 100, canvas.height - 10);
    ctx.fillText("y (height)", 10, 20);
}

// ---------- DRAW SIMULATION ----------
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

    // moving projectile dot (IMPORTANT)
    if (points.length > 0) {
        let last = points[points.length - 1];

        let px = last.x * scale;
        let py = canvas.height - last.y * scale;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ---------- START ----------
reset();
step();