const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");
const cursor = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
    //variables to be used when creating the arrow
    var headlen = 10 * scl;
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
function xtr(x) {
    return (x + xoff) * scl;
}
function ytr(y) {
    return (y + yoff) * scl;
}
class Body {
    constructor(
        x = Math.random() * canvas.width,
        y = .2 * canvas.height + Math.random() * canvas.height * 0.6,
        r = 5 + Math.random() * 50,
        m = Math.random(),
        color = generateHSLColor()) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.m = m;
        this.lw = 1 * baseLW;
        this.color = color;
        this.tangible = true;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.arc(xtr(this.x), ytr(this.y), this.r * scl, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
class Planet extends Body {
    constructor(
        // x = (0.5 * X) + (1.5 * X * (Math.random() - 0.5)),
        x = (1.5 * 800 * (Math.random() - 0.5)),
        y = (0.5 * 700 * (Math.random() - 0.5)),
        r = 5 + Math.random() * 50,
        d = Math.random() + .2,
    ) {
        let m = d * r ** 2 / 50 ** 2
        let colorString = `hsl(${50 + d * 150}, 100%, 50%)`
        super(x, y, r, m, colorString);

    }
}
class Base extends Body {
    constructor(n, x, y, r, color, th, sp) {
        super(x, y, r, 0, color);
        this.n = n;
        this.th = th;
        this.sp = sp;
        this.isBase = true;
        this.nhits = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lw;
        ctx.arc(xtr(this.x), ytr(this.y), this.r * scl, 0, 2 * Math.PI);
        ctx.stroke();

        // ctx.moveTo(this.x,this.y)
        drawArrow(ctx, xtr(this.x), ytr(this.y), xtr(this.x + (this.r + this.sp) * Math.cos(this.th)), ytr(this.y + (this.r + this.sp) * Math.sin(this.th)), 1 * baseLW, this.fillColor);
    }
    launch() {
        projArray.push(new Projectile(this.x + (projSize + this.r + this.sp) * Math.cos(this.th), this.y + (projSize + this.r + this.sp) * Math.sin(this.th), this.sp * Math.cos(this.th), this.sp * Math.sin(this.th), projSize, 1, projCol[this.n], this.n))
    }
}
class Projectile extends Body {
    constructor(x = 40, y = 40, u = 0, v = 10, r = 20, m = 0, color = "#FF0000", base = 0) {
        super(x, y, r, m, color);
        this.live = true;
        this.visible = true;
        this.tracked = true;
        this.base = base;
        this.u = u;
        this.v = v;
        this.lw = 1.5 * baseLW;
        this.ud = 0;
        this.vd = 0;
        this.setAccel();
        this.t = 0
        this.tangible = false; //can collide?
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
        if (this.live) {
            this.setAccel()

            this.u = this.u + dt * this.ud;
            this.v = this.v + dt * this.vd;

            this.x = this.x + dt * this.u;
            this.y = this.y + dt * this.v;
            this.t = this.t + 1;
            if (this.t > maxAge & (Math.abs(this.x) > maxRange || Math.abs(this.y) > maxRange)) {
                // this.live = false;
                // this.visible = false;
                this.tracked = false
            }
        }
    }
    draw() {
        if (this.visible) super.draw();
        // if (this.live) {
        //     drawArrow(ctx, this.x, this.y, this.x + vscl * this.u, this.y + vscl * this.v, 1, "green")
        //     drawArrow(ctx, this.x, this.y, this.x + ascl * this.ud, this.y + ascl * this.vd, 1, "red")
        // }
    }
    detectCollision(bodyArray) {
        bodyArray.forEach(b => {
            if (b.tangible & b != this) { // check it's live and and don't allow self collision
                let dsq = (b.x - this.x) ** 2 + (b.y - this.y) ** 2 - (b.r + this.r) ** 2;
                if (dsq < 0) {
                    // back up to linear estimate of collision site
                    let d = ((b.x - this.x) ** 2 + (b.y - this.y) ** 2) ** 0.5 - (b.r + this.r);
                    let th = Math.atan2(this.v, this.u)
                    this.x = this.x + d * Math.cos(th);
                    this.y = this.y + d * Math.sin(th);
                    // console.log("Boom!");
                    this.live = false;
                    this.tracked = false;
                    this.tangible = true;
                    if (b.isBase) {
                        b.nhits = b.nhits + 1
                        explosionArray.push(new Explosion(this.x, this.y, 20, 300))
                    }
                    else {
                        explosionArray.push(new Explosion(this.x, this.y, 5, 50))
                    }
                }
            }
        })
    }
}
class Ring {
    constructor(x, y, rmax) {
        this.r = 0;
        this.dr = expSpeed;
        this.rmax = rmax
        this.x = x;
        this.y = y;
        this.hue = 60;
        this.lightness = 50;
        this.alpha = 1;
        this.live = true;
        this.dhue = 100 * this.dr / this.rmax;

    }
    update() {
        if (this.live) {
            this.r = this.r + this.dr;
            this.live = this.r < this.rmax;
            this.hue = this.hue - this.dhue;
            this.alpha = 1 - (this.r / this.rmax) ** 2;
        }
    }
    draw() {
        if (this.live) {
            ctx.beginPath();
            ctx.lineWidth = 1 * baseLW;
            ctx.strokeStyle = `hsla(${this.hue},100%,${this.lightness}%,${this.alpha})`;
            ctx.arc(xtr(this.x), ytr(this.y), this.r * scl, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}
class Explosion {
    constructor(x, y, n, r) {
        this.x = x;
        this.y = y;
        this.lw = 1 * baseLW;
        this.t = 0;
        this.n = n;
        this.r = r;
        this.omg = 5;
        this.live = true
        this.ringArray = []
        this.ringArray.push(new Ring(x, y, r))
    }
    update() {
        if (this.live) {
            this.t++;
            this.live = this.t < (this.r / expSpeed + this.omg * this.n)
            this.ringArray.forEach(ring => ring.update())

            if (this.t % this.omg == 0 && this.ringArray.length < this.n) {
                this.ringArray.push(new Ring(this.x, this.y, this.r))
            }
        }
    }
    draw() {
        if (this.live) {
            this.ringArray.forEach(r => r.draw());
        }
    }
}
function generatePlanets(n) {
    for (let i = 0; i < n; i++) {
        planetArray[i] = new Planet();
    }
}
function generateHSLColor(hueWidth = Math.random() * 30, hueStart = 160, valueWidth = 20, valueStart = 50) {
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
    X = innerWidth * window.devicePixelRatio;
    Y = innerHeight * window.devicePixelRatio;
    AR = Y / X;
    // set initial bounding window
    minx = -300;
    miny = -600;
    maxx = 300;
    maxy = 600;

    canvas.height = Y;
    canvas.width = X;
    canvas.style.width = window.innerWidth + "px"
    canvas.style.height = window.innerHeight + "px"
}

addEventListener("mousedown", e => {
    // e.preventDefault();
    pointerDownHandler(e.offsetX, e.offsetY);
},
    // { passive: false }
);
addEventListener('mousemove', e => {
    if (mouseDown) {
        pointerMoveHandler(e.offsetX, e.offsetY)
    }
});
addEventListener('mouseup', e => {
    mouseDown = false;
});
addEventListener("touchstart", e => {
    e.preventDefault();
    pointerDownHandler(e.touches[0].clientX, e.touches[0].clientY);
},
    { passive: false }
);
addEventListener("touchmove", e => {
    e.preventDefault();
    pointerMoveHandler(e.touches[0].clientX, e.touches[0].clientY)
},
    { passive: false }
);

function pointerDownHandler(xc, yc) {
    x=xc*devicePixelRatio;
    y=yc*devicePixelRatio;
    let now = new Date().getTime();
    let timeSince = now - lastTouch;
    if (timeSince < 300) {
        //double touch
        doubleClickHandler(basex);
    }
    lastTouch = new Date().getTime()
    cursor.x = x;
    cursor.y = y;
    if (cursor.y > canvas.height * 2 / 3) {
        basex = 0;
    }
    else if (cursor.y < canvas.height * 1 / 3) {
        basex = 1;
    }
    else {
        basex = 2;
    }

    mouseDown = true;
    if (basex < 2) {
        th0 = baseArray[basex].th;
        sp0 = baseArray[basex].sp;
    }
}
function pointerMoveHandler(xc, yc) {
    x=xc*devicePixelRatio;
    y=yc*devicePixelRatio;
    if (basex==0){
        inv=1;
    }
    else{
        inv=-1
    }
    if (basex < 2) {
        dth = (x - cursor.x) * dth_sens*inv
        baseArray[basex].th = th0 + dth;
        dsp = (y - cursor.y) * -dsp_sens*inv
        baseArray[basex].sp = Math.max(0, Math.min(sp0 + dsp, maxspeed))
    }
}
function doubleClickHandler(basex) {
    // console.log(basex)
    if (basex < 2) {
        baseArray[basex].launch()
    }
    else {
        trackAll = !trackAll;
    }
}
function redraw() {
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    planetArray.forEach((x) => x.draw())
    projArray.forEach((x) => x.draw())
    baseArray.forEach((x) => x.draw())
    explosionArray.forEach((x) => x.draw())
}
function anim() {
    requestAnimationFrame(anim);
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    explosionArray.forEach((e) => {
        e.update()
    })
    projArray.forEach((proj) => {
        proj.update()
        if (proj.live) {
            proj.detectCollision(planetArray)
            proj.detectCollision(baseArray)
            proj.detectCollision(projArray)
        }

        // proj.draw()
    })

    calcScl()
    redraw()
    drawScores()
}
function drawScores() {

    ctx.font = 40 * window.devicePixelRatio + "px Arial";
    ctx.textBaseline = "alphabetic"
    ctx.strokeStyle = baseCol[0]
    ctx.strokeText(baseArray[1].nhits, 8 * window.devicePixelRatio, canvas.height - 10 * window.devicePixelRatio);
    ctx.strokeStyle = baseCol[1]
    ctx.textBaseline = "hanging"
    ctx.strokeText(baseArray[0].nhits, 8 * window.devicePixelRatio, 8 * window.devicePixelRatio);
}
function calcScl() { //calculate zoom (scl) and pan (xoff, yoff)
    // find smallest bounding window, defined by extrema of projectiles and starting window
    let xp, xpp, Xp, yp, ypp, Yp;
    let pminx = -100;
    let pmaxx = 100;
    let pminy = -400;
    let pmaxy = 400;

    projArray.forEach(p => {
        if (p.tracked || trackAll) {
            pmaxx = Math.max(pmaxx, p.x + buf);
            pmaxy = Math.max(pmaxy, p.y + buf);
            pminx = Math.min(pminx, p.x - buf);
            pminy = Math.min(pminy, p.y - buf);
        }
    })

    explosionArray.forEach(p => {
        if (p.live) {
            pmaxx = Math.max(pmaxx, p.x + buf);
            pmaxy = Math.max(pmaxy, p.y + buf);
            pminx = Math.min(pminx, p.x - buf);
            pminy = Math.min(pminy, p.y - buf);
        }
    })

    // // smooth bounding window changes - zooming in
    // maxx = Math.max(pmaxx, maxx - (maxx - pmaxx) * zoomsmth);
    // maxy = Math.max(pmaxy, maxy - (maxy - pmaxy) * zoomsmth);
    // minx = Math.min(pminx, minx + (pminx - minx) * zoomsmth);
    // miny = Math.min(pminy, miny + (pminy - miny) * zoomsmth);
    // zooming out
    // let zoomspd = 0.15;
    maxx = maxx - (maxx - pmaxx) * zoomsmth;
    maxy = maxy - (maxy - pmaxy) * zoomsmth;
    minx = minx + (pminx - minx) * zoomsmth;
    miny = miny + (pminy - miny) * zoomsmth;

    // adjust bounding window to fit aspect ratio
    // single p, prime, new bounding window
    xp = [minx, maxx];
    yp = [miny, maxy];
    Xp = xp[1] - xp[0];
    Yp = yp[1] - yp[0];
    ARp = Yp / Xp;
    ARR = ARp / AR;

    //p, double primes, window coords after aspect correction
    if (ARR < 1) { // too short, make taller
        let ax = (AR * Xp - Yp) / 2
        ypp = [yp[0] - ax, yp[1] + ax];
        xpp = xp;
    }
    else { // too narrow, make wider
        let ax = (Yp / AR - Xp) / 2
        xpp = [xp[0] - ax, xp[1] + ax];
        ypp = yp;
    }
    // set scale and offset for drawing transforms
    scl = X / (xpp[1] - xpp[0]);
    xoff = -xpp[0];
    yoff = -ypp[0];
}
function initalize() {
    setSize()
    // nP = Math.round(Y / 30);
    generatePlanets(10)
    baseArray.push(new Base(0, 0, 300, 20, baseCol[0], 3 * Math.PI / 2, 20,))
    baseArray.push(new Base(1, 0, -300, 20, baseCol[1], 1 * Math.PI / 2, 20,))
}
let X, Y, AR, ARR, ARp;
let maxx, maxy, minx, miny;
let xoff, yoff = 0;
let scl = 1;
let buf = 50;

let projArray = [];
let baseArray = [];
let planetArray = [];
let explosionArray = [];

let mouseDown = false;
let trackAll = false;
let lastTouch = new Date().getTime();
let basex;

const projCol = ["#FFBBBB", "#BBBBFF"]
const baseCol = ["#FF9999", "#9999FF"]
const baseLW = 1 * window.devicePixelRatio;
const zoomsmth = 0.15; // zoom speed, 1 is instant
const vscl = 2; // velocity vector scale
const ascl = 5; // acceleration vector scale
const projSize = 3; // projectile radius
const maxAge = 1000; // timesteps to keep tracking projectile
const expSpeed = 2; // explosion ring speed
const maxRange = 800; // range to keep tracking projectile
const dth_sens = 0.001; // angle adjustment sensitivity
const dsp_sens = 0.05; // speed adjustment sensitivity
const G = 200000; // gravitational constant in who-knows-what units
const dt = 0.1; // time step
const maxspeed = 50; // max launch speed
const bgFillStyle = "rgba(0,0,0,1)"; // background color + blur, 1 for no blur.

initalize();
anim()