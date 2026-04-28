const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Physics parameters
let v0 = 50;
let angle = 45;
let g = 9.8;
let h = 0;

// Convert angle
let theta = angle * Math.PI / 180;

// Time system
let t = 0;
let dt = 0.05;

// Initial velocity components
let vx = v0 * Math.cos(theta);
let vy = v0 * Math.sin(theta);

// Trail storage (for smooth curve)
let points = [];

function reset() {
    t = 0;
    points = [];

    theta = angle * Math.PI / 180;
    vx = v0 * Math.cos(theta);
    vy = v0 * Math.sin(theta);
}

function update() {
    t += dt;

    let x = vx * t;
    let y = h + vy * t - 0.5 * g * t * t;

    if (y < 0) return; // stop when it hits ground

    points.push({ x, y });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    // Scale dynamically
    let scale = canvas.width / 200;

    // Path
    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
        let px = points[i].x;
        let py = points[i].y;

        let canvasX = px * scale;
        let canvasY = canvas.height - py * scale;

        if (i === 0) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }

    ctx.stroke();

    // Draw projectile (latest point)
    if (points.length > 0) {
        let last = points[points.length - 1];

        ctx.beginPath();
        ctx.arc(last.x * scale, canvas.height - last.y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Start simulation
reset();
update();