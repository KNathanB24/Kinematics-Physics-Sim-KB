const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Physics
let v0 = 80;        // increased so motion is visible
let angle = 45;
let g = 9.8;
let h = 0;

// Convert angle
let theta = angle * Math.PI / 180;

// State
let t = 0;
let running = true;
let points = [];

// Animation scale (important fix)
const scale = 3;

// Velocity components
let vx, vy;

function reset() {
    t = 0;
    points = [];

    theta = angle * Math.PI / 180;
    vx = v0 * Math.cos(theta);
    vy = v0 * Math.sin(theta);

    running = true;
}

function step() {
    if (!running) return;

    // time based on frame rate (important fix)
    t += 0.05;

    let x = vx * t;
    let y = h + vy * t - 0.5 * g * t * t;

    if (y < 0) {
        running = false;
        return;
    }

    points.push({ x, y });

    draw();
    requestAnimationFrame(step);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    // path
    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
        let px = points[i].x * scale;
        let py = canvas.height - points[i].y * scale;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.stroke();

    // projectile
    if (points.length > 0) {
        let last = points[points.length - 1];

        ctx.beginPath();
        ctx.arc(
            last.x * scale,
            canvas.height - last.y * scale,
            5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// start
reset();
step();