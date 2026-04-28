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