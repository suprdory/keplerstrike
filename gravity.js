const canvas = document.getElementById("cw");
const ctx = canvas.getContext("2d");

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
        x = 40,
        y = 40,
        r = 20,
        u = 0,
        v = 0,
        color = "#FF0000") {
        this.x = x;
        this.y = y;
        this.r = r;
        this.u = u;
        this.v = v;
        this.ud = 0;
        this.vd = 0;
        this.fillColor = color;
        this.calc_accel()
    }
    move() {
        this.x = this.x + dt * this.u;
        this.y = this.y + dt * this.v;
    }
    accel() {
        this.u = this.u + dt * this.ud;
        this.v = this.v + dt * this.vd;
    }
    calc_accel() {
        let ax = 0;
        let ay = 0;
        let r2= 0;
        let atan2=0;
        planetArray.forEach((p) => {
            r2 = (this.x - p.x) ** 2 + (this.y - p.y) ** 2;
            atan2 = Math.atan2(this.y - p.y, this.x - p.x);
            ax = ax + -G * p.m / r2  * Math.cos(atan2);
            ay = ay + -G * p.m / r2 * Math.sin(atan2);
        })
        this.ud = ax;
        this.vd = ay;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.fillColor;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
        drawArrow(ctx, this.x, this.y, this.x + vscl * this.u, this.y + vscl *this.v, 1, "green")
        drawArrow(ctx, this.x, this.y, this.x + ascl * this.ud, this.y + ascl *this.vd, 1, "red")
    }
}

class Planet {
    constructor(
        x = Math.random() * innerWidth,
        y = Math.random() * innerHeight,
        r = Math.random() * 200,
        m = Math.random(),
        color = 0) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.m = m;
        this.fillColor = color;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.fillColor;
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
    setColor(newColor) {
        this.fillColor = newColor
    }
}

function generatePlanets(n) {
    for (let i = 0; i < n; i++) {
        planetArray[i] = new Planet();
    }
}

function generateHSLColor(hueWidth, hueStart, valueWidth, valueStart) {
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

    bodyArray.forEach((body) => {
        body.calc_accel()
        body.accel()
        body.move()
        body.draw()
    })
}

const vscl = 2
const ascl = 20

const G = 100000
const dt = 0.1
let bgFillStyle = "rgba(0,0,0,.002)"
setSize()
let planetArray = [];
planetArray.push(new Planet(canvas.width/2, canvas.height/2, 40, 1.0, "#55AA55"))
planetArray.push(new Planet(canvas.width/2-20, canvas.height / 2-30, 30, 1.0, "#5555AA"))
// planetArray.push(new Planet(240, 550, 30, .5, "#AA5555"))

let bodyArray = []
bodyArray.push(new Body(canvas.width / 2-220, canvas.height / 2, 5, 0, 20, 'blue'));

planetArray.forEach((planet) => planet.draw())
// bodyArray.forEach((body) => body.draw())

anim()