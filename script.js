const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// UI
const v0Slider = document.getElementById("v0");
const angleSlider = document.getElementById("angle");
const gSlider = document.getElementById("gSlider");
const massSlider = document.getElementById("massSlider");

const timeEl = document.getElementById("time");
const heightEl = document.getElementById("height");
const rangeEl = document.getElementById("range");

const xPosEl = document.getElementById("xPos");
const yPosEl = document.getElementById("yPos");

const keValue = document.getElementById("keValue");
const peValue = document.getElementById("peValue");
const teValue = document.getElementById("teValue");

const keBar = document.getElementById("keBar");
const peBar = document.getElementById("peBar");
const teBar = document.getElementById("teBar");

const instructions = document.getElementById("instructions");
const header = document.getElementById("instructionsHeader");

// toggle instructions
header.onclick = () => {
    instructions.classList.toggle("collapsed");
};

// physics
let v0 = 80;
let angle = 45;
let g = 9.8;
let mass = 1;
let h = 0;

let t = 0;
let running = false;
let points = [];

let vx, vy;
let scale = 1;

let maxX = 0;
let maxY = 0;
let maxHeight = 0;
let finalRange = 0;

let initialEnergy = 1;

// setup
function setup() {
    let rad = angle * Math.PI / 180;
    vx = v0 * Math.cos(rad);
    vy = v0 * Math.sin(rad);

    initialEnergy = 0.5 * mass * (vx*vx + vy*vy) + mass*g*h;
}

// reset
function reset() {
    t = 0;
    points = [{x:0,y:0}];
    running = false;

    maxX = maxY = maxHeight = finalRange = 0;

    setup();
    draw();
}

// update energy
function energy(x,y) {
    let vxC = vx;
    let vyC = vy - g*t;

    let ke = 0.5 * mass * (vxC*vxC + vyC*vyC);
    let pe = mass * g * y;

    keValue.textContent = ke.toFixed(1);
    peValue.textContent = pe.toFixed(1);
    teValue.textContent = (ke+pe).toFixed(1);
}

// step
function step() {
    if (!running) return;

    let dt = 0.05;
    t += dt;

    let x = vx * t;
    let y = h + vy*t - 0.5*g*t*t;

    if (y < 0) {
        running = false;
        finalRange = x;
        y = 0;
        points.push({x,y});
        draw();
        return;
    }

    points.push({x,y});

    maxHeight = Math.max(maxHeight, y);

    energy(x,y);
    draw();

    requestAnimationFrame(step);
}

// draw
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = "blue";

    for (let i=0;i<points.length;i++){
        let px = points[i].x;
        let py = canvas.height - points[i].y;

        if (i===0) ctx.moveTo(px,py);
        else ctx.lineTo(px,py);
    }

    ctx.stroke();
}

// controls
document.getElementById("startBtn").onclick = () => {
    if (!running) {
        running = true;
        step();
    }
};

document.getElementById("pauseBtn").onclick = () => running = false;

document.getElementById("resetBtn").onclick = reset;

v0Slider.oninput = () => { v0 = +v0Slider.value; reset(); };
angleSlider.oninput = () => { angle = +angleSlider.value; reset(); };
gSlider.oninput = () => { g = +gSlider.value; reset(); };
massSlider.oninput = () => { mass = +massSlider.value; reset(); };

// gravity presets
window.setGravityPreset = (val) => {
    g = val;
    gSlider.value = val;
    reset();
};

reset();