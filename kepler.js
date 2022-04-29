const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    ctx.save();
    ctx.strokeStyle = color;

    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7),
        toy - headlen * Math.sin(angle + Math.PI / 7));

    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
        toy - headlen * Math.sin(angle - Math.PI / 7));

    //draws the paths created above
    ctx.stroke();
    ctx.restore();
}
class Body {
    constructor(
        x = Math.random() * canvas.width,
        y = .15 * canvas.height + Math.random() * canvas.height * 0.6,
        r = 5 + Math.random() * 50,
        m = Math.random(),
        color = generateHSLColor()) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.m = m;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
class Base extends Body {
    constructor(n, x, y, r, color, th, sp) {
        super(x, y, r, 0, color);
        this.n = n;
        this.th = th;
        this.sp = sp;
    }
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.stroke();

        // ctx.moveTo(this.x,this.y)
        drawArrow(ctx, this.x, this.y, this.x + (this.r + this.sp) * Math.cos(this.th), this.y + (this.r + this.sp) * Math.sin(this.th), 1, this.fillColor);
    }
    launch() {
        projArray.push(new Projectile(this.x, this.y, this.sp * Math.cos(this.th), this.sp * Math.sin(this.th), projSize, 1, projCol))
    }
}
class Projectile extends Body {
    constructor(x = 40, y = 40, u = 0, v = 10, r = 20, m = 0, color = "#FF0000") {
        super(x, y, r, m, color);
        this.u = u;
        this.v = v;
        this.ud = 0;
        this.vd = 0;
        this.setAccel();
    }
    setAccel() {
        this.ud = 0;
        this.vd = 0;
        let r2 = 0;
        let atan2 = 0;
        planetArray.forEach((p) => {
            r2 = (this.x - p.x) ** 2 + (this.y - p.y) ** 2;
            atan2 = Math.atan2(this.y - p.y, this.x - p.x);
            this.ud = this.ud + p.m / r2 * Math.cos(atan2);
            this.vd = this.vd + p.m / r2 * Math.sin(atan2);
        })
        this.ud = -G * this.ud;
        this.vd = -G * this.vd;
    }

    update() {
        this.setAccel()

        this.u = this.u + dt * this.ud;
        this.v = this.v + dt * this.vd;

        this.x = this.x + dt * this.u;
        this.y = this.y + dt * this.v;
    }
    draw() {
        super.draw()
        drawArrow(ctx, this.x, this.y, this.x + vscl * this.u, this.y + vscl * this.v, 1, "green")
        drawArrow(ctx, this.x, this.y, this.x + ascl * this.ud, this.y + ascl * this.vd, 1, "red")
    }
}
function generatePlanets(n) {
    for (let i = 0; i < n; i++) {
        planetArray[i] = new Body();
    }
}
function generateHSLColor(hueWidth = Math.random() * 255, hueStart = Math.random() * 255, valueWidth = 20, valueStart = 50) {
    let colorString = 'hsl(' + (Math.random() * hueWidth + hueStart) + ' , 100%, ' + (Math.random() ** 2 * valueWidth + valueStart) + '%)'
    return colorString;
}
function setColors() {
    let hueWidth = Math.random() ** 2 * 360
    let hueStart = Math.random() * 360
    let valueStart = 50 + Math.random() ** 2 * 50
    let valueWidth = Math.random() ** 2 * 50
    planetArray.forEach((planet) => planet.setColor(
        generateHSLColor(hueWidth, hueStart, valueWidth, valueStart)))
}
function setSize() {
    canvas.height = innerHeight;
    canvas.width = innerWidth;
}
function anim() {
    requestAnimationFrame(anim);
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    planetArray.forEach((planet) => planet.draw())
    projArray.forEach((proj) => {
        proj.update()
        // proj.draw()
    })
    redraw()
}
mouseDown = false;
let lastTouch = new Date().getTime();
addEventListener('mousedown', e => {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    mouseDown = true;
    lastTouch = new Date().getTime();
    th0 = baseArray[0].th;
    sp0 = baseArray[0].sp;
});
addEventListener("touchstart", e => {
    e.preventDefault();
    let now = new Date().getTime();
    let timeSince = now - lastTouch;

    if (timeSince < 300) {
        //double touch
        doubleClick();

    }
    lastTouch = new Date().getTime()
    cursor.x = e.touches[0].clientX;
    cursor.y = e.touches[0].clientY;
    mouseDown = true;
    th0 = baseArray[0].th;
    sp0 = baseArray[0].sp;
},
    { passive: false }
);

addEventListener('mousemove', e => {
    if (mouseDown) {
        dth = (e.offsetX - cursor.x) * 0.01
        baseArray[0].th = th0 + dth;
        dsp = (e.offsetY - cursor.y) * -0.5
        baseArray[0].sp = sp0 + dsp;
        redraw()
    }
});
addEventListener("touchmove", e => {
    e.preventDefault();
    dth = (e.touches[0].clientX - cursor.x) * 0.01
    baseArray[0].th = th0 + dth;
    dsp = (e.touches[0].clientY - cursor.y) * -0.5
    baseArray[0].sp = sp0 + dsp;
    redraw()
},
    { passive: false }
);

addEventListener('mouseup', e => {
    mouseDown = false;
});
addEventListener("touchend", e => {
    e.preventDefault();
    mouseDown = false;
},
    { passive: false }
);
addEventListener('dblclick', e => {
    doubleClick();
});

function doubleClick() {
    baseArray[0].launch()
}

function redraw() {
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    planetArray.forEach((x) => x.draw())
    projArray.forEach((x) => x.draw())
    baseArray.forEach((x) => x.draw())
}

const vscl = 2 // velocity vector scale
const ascl = 5 // acceleration vector scale
const projCol = 'blue'
const projSize = 5

const G = 100000
const dt = 0.1

let bgFadeStyle = "rgba(0,0,0,.002)"
let bgFillStyle = "rgba(0,0,0,1)"

setSize()

let planetArray = [];
// planetArray.push(new Body(canvas.width / 2, canvas.height / 2, 40, 1.0, "#55AA55"))
// planetArray.push(new Body(canvas.width / 2 - 20, canvas.height / 2 - 30, 30, 1.0, "#5555AA"))
generatePlanets(5)

let projArray = [];
// projArray.push(new Projectile(canvas.width / 2 - 220, canvas.height / 2, 0, 20, 5, 1, 'blue'));

let baseArray = [];
baseArray.push(new Base(1, canvas.width * 0.5, canvas.height * 0.9, 20, "#FFBBBB", 3 * Math.PI / 2, 20,))
baseArray.push(new Base(2, canvas.width * 0.5, canvas.height * 0.1, 20, "#BBBBFF", 1 * Math.PI / 2, 20,))



// redraw()

anim()