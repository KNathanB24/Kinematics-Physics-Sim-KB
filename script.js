window.onload = function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let v0 = 50;
    let angle = 45;
    let g = 9.8;
    let h = 0;

    let theta = angle * Math.PI / 180;
    let dt = 0.1;

    let points = [];

    for (let t = 0; t < 10; t += dt) {
        let x = v0 * Math.cos(theta) * t;
        let y = h + v0 * Math.sin(theta) * t - 0.5 * g * t * t;

        if (y < 0) break;

        points.push({ x, y });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();

        ctx.beginPath();

        for (let i = 0; i < points.length; i++) {
            let px = points[i].x;
            let py = points[i].y;

            let scale = canvas.width / 100;
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
};