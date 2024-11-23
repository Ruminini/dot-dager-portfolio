const spacing = 16;
const canvas = document.querySelector(".dot-background");
const ctx = canvas.getContext("2d");
let w, h;
let dots = [];
let activeDots = new Set();
let animationId;
const mouse = { x: 0, y: 0 };
let mouseMoved = false;
document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
	const { clientX, clientY } = event;
	if (
		Math.abs(mouse.x - clientX) < spacing / 2 &&
		Math.abs(mouse.y - clientY) < spacing / 2
	)
		return;
	mouse.x = clientX;
	mouse.y = clientY;
	mouseMoved = true;
}

function setup() {
	if (animationId) cancelAnimationFrame(animationId);
	w = canvas.width = window.innerWidth;
	h = canvas.height = window.innerHeight;
	ctx.fillStyle = `hsl(232, 50%, 15%)`;
	ctx.fillRect(0, 0, w, h);
	for (let y = (h % spacing) / 2; y < h; y += spacing) {
		for (let x = (w % spacing) / 2; x < w; x += spacing) {
			dots.push(new Dot(x, y));
		}
	}
	dots.forEach((dot) => {
		dot.draw();
	});
}

function draw() {
	animationId = requestAnimationFrame(draw);
	if (mouseMoved) {
		mouseMoved = false;
		const dotsX = Math.ceil(w / spacing);
		const mDotX = Math.floor(mouse.x / spacing);
		const mDotY = Math.floor(mouse.y / spacing);
		for (let x = mDotX - 3; x < mDotX + 4; x++) {
			for (let y = mDotY - 3; y < mDotY + 4; y++) {
				pos = x + y * dotsX;
				if (pos > 0 && pos < dots.length) {
					const d = Math.sqrt(
						(dots[pos].x - mouse.x) ** 2 + (dots[pos].y - mouse.y) ** 2
					);
					if (d < spacing * 3) {
						dots[pos].brighten();
						activeDots.add(dots[pos]);
					}
				}
			}
		}
	}
	activeDots.forEach((dot) => {
		dot.draw();
		dot.update();
	});
}

const maxColor = { h: 290, s: 100, l: 80 };
const minColor = { h: 232, s: 50, l: 25 };

class Dot {
	constructor(x, y, r = 1, c = minColor) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.c = { ...c };
	}

	brighten() {
		this.c = { ...maxColor };
	}

	setColor(c) {
		this.c = { ...c };
	}

	dimm() {
		this.c = { ...minColor };
	}

	update() {
		if (
			this.c.h === minColor.h &&
			this.c.s === minColor.s &&
			this.c.l === minColor.l
		)
			activeDots.delete(this);
		this.c.h = Math.max(this.c.h - 1, minColor.h);
		this.c.s = Math.max(this.c.s - 1, minColor.s);
		this.c.l = Math.max(this.c.l - 1, minColor.l);
	}

	draw() {
		ctx.fillStyle = `hsl(${this.c.h}, ${this.c.s}%, ${Math.max(
			this.c.l / 2,
			minColor.l - 10
		)}%)`;
		ctx.fillRect(this.x - 1, this.y - 1, this.r + 2, this.r + 1);
		ctx.fillStyle = `hsl(${this.c.h}, ${this.c.s}%, ${this.c.l}%)`;
		ctx.fillRect(this.x, this.y, this.r, this.r);
	}
}

setup();
draw();
