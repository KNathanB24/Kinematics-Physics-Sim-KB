const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Physics parameters
let v0 = 80;
let angle = 45;
let g = 9.8;
let h = 0;

// Time + state
let t = 0;
let running = true;
let points = [];

// Velocity components
let vx, vy;
let theta;

// Scale (computed per simulation)
let scale;

function reset() {
    t = 0;
    points = [];
    running = true;

    // Convert angle
    theta = angle * Math.PI / 180;

    // Velocity components
    vx = v0 * Math.cos(theta);
    vy = v0 * Math.sin(theta);

    // Estimate range and compute scale (IMPORTANT FIX)
    let range = (v0 * v0 * Math.sin(2 * theta)) / g;

    // prevent divide-by-zero or tiny angles
    if (range < 1) range = 1;

    scale = canvas.width / (range * 1.2);
}

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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    // Trajectory
    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
        let px = points[i].x * scale;
        let py = canvas.height - points[i].y * scale;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }

    ctx.stroke();

    // Projectile (moving dot)
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

// Start simulation
reset();
step();