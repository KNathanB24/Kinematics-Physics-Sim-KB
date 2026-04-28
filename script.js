const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// --- Physics parameters ---
let v0 = 50;           // initial velocity
let angle = 45;        // degrees
let g = 9.8;           // gravity
let h = 0;             // initial height

// Convert angle to radians
let theta = angle * Math.PI / 180;

// Time step
let dt = 0.1;

// Store points
let points = [];

// Generate trajectory
for (let t = 0; t < 10; t += dt) {
    let x = v0 * Math.cos(theta) * t;
    let y = h + v0 * Math.sin(theta) * t - 0.5 * g * t * t;

    if (y < 0) break;

    points.push({ x, y });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
        let px = points[i].x;
        let py = points[i].y;

        // Scale + flip y-axis
        let scale = 5;
        let canvasX = px * scale;
        let canvasY = canvas.height - (py * scale);

        if (i === 0) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }

    ctx.stroke();
}

draw();