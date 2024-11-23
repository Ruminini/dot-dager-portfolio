const lumberCanvas = document.getElementById("gameCanvas");
const lctx = lumberCanvas.getContext("2d");

// Canvas dimensions
const width = lumberCanvas.width;
const height = lumberCanvas.height;
let score = 0;
let gameOver = true;
const tree = [];
const center = width / 2;
let lumberSide = -1;
let prevSide = -1;
let flyingStuff = new Set();

const chopLog = new Audio("./assets/lumber/hit1.mp3");
const chopBranch = new Audio("./assets/lumber/hit2.mp3");
const chopHead = new Audio("./assets/lumber/hit3.mp3");
const htmlIsNot = new Audio("./assets/lumber/HTML is not.mp3");
htmlIsNot.loop = true;
const branch = new Image();
branch.src = "assets/lumber/branch.svg";
const hand_down = new Image();
hand_down.src = "assets/lumber/hand_down.svg";
const hand_up = new Image();
hand_up.src = "assets/lumber/hand_up.svg";
const lumber_body = new Image();
lumber_body.src = "assets/lumber/dager_body.svg";
const lumber_died = new Image();
lumber_died.src = "assets/lumber/lumber_died.svg";
const trunk = new Image();
trunk.src = "assets/lumber/trunk.svg";
const stones = new Image();
stones.src = "assets/lumber/stones.svg";
let mute = false;
let firstLoss = true;

document.addEventListener("keydown", (e) => {
	if (e.key === "ArrowLeft") chopTree(-1);
	if (e.key === "ArrowRight") chopTree(1);
	if (
		(e.key === "Enter" || e.key === "NumpadEnter" || e.key === " ") &&
		gameOver
	) {
		gameOver = false;
		lumberSetup();
	}
});

function lumberSetup() {
	score = 0;
	gameOver = false;
	lumberSide = -1;
	tree.length = 0;
	generateTree();
	gameLoop();
}

function generateTree() {
	tree.push(0);
	tree.push(0);
	for (let i = 0; i < 10; i++) {
		const branch = Math.round(Math.random()) ? 1 : -1; // -1: Left, 1: Right
		tree.push(0);
		tree.push(branch);
	}
}

function drawLumberjack() {
	const y = height - lumber_body.height;
	if (lumberSide < 0) {
		const x = center - trunk.width / 2;
		lctx.save();
		lctx.scale(-1, 1);
		lctx.drawImage(lumber_body, -x + 20, y);
		lctx.drawImage(hand_up, -x + lumber_body.width / 2 + 20, y);
		lctx.restore();
	} else {
		const x = center + trunk.width / 2;
		lctx.drawImage(lumber_body, x + 20, y);
		lctx.drawImage(hand_up, x + lumber_body.width / 2, y);
	}
}

function drawCuttingLumberjack(nextSide) {
	const y = height - lumber_body.height;
	const displacement = trunk.width / 2 + 20;
	lctx.clearRect(
		lumberSide < 0
			? center - displacement - lumber_body.width / 2 - hand_up.width
			: center + displacement,
		height - lumber_body.height,
		hand_up.width,
		lumber_body.height
	);
	if (nextSide < 0) {
		const x = center - trunk.width / 2;
		lctx.save();
		lctx.scale(-1, 1);
		lctx.drawImage(lumber_body, -x + 20, y);
		lctx.drawImage(hand_down, -x + lumber_body.width / 2 + 20, y);
		lctx.restore();
	} else {
		const x = center + trunk.width / 2;
		lctx.drawImage(lumber_body, x + 20, y);
		lctx.drawImage(hand_down, x + lumber_body.width / 2, y);
	}
}

function drawDeadLumberjack() {
	const y = height - lumber_died.height;
	if (lumberSide < 0) {
		const x = center - trunk.width / 2;
		lctx.save();
		lctx.scale(-1, 1);
		lctx.drawImage(lumber_died, -x, y);
		lctx.restore();
	} else {
		const x = center + trunk.width / 2;
		lctx.drawImage(lumber_died, x, y);
	}
	lctx.drawImage(
		trunk,
		center - trunk.width / 2,
		height - trunk.width - stones.height / 2,
		trunk.width,
		trunk.width
	);
	lctx.drawImage(stones, center - stones.width / 2, height - stones.height);
}

function drawTree() {
	for (let i = 0; i < tree.length; i++) {
		const y = height - (lumber_body.height / 2) * (i + 2.5);
		if (tree[i] < 0) {
			lctx.save();
			lctx.scale(-1, 1);
			lctx.drawImage(branch, -center + 20, y);
			lctx.restore();
		} else if (tree[i] > 0) {
			lctx.drawImage(branch, center + 20, y);
		}
	}
	lctx.drawImage(
		trunk,
		center - trunk.width / 2,
		height - trunk.height - stones.height / 2
	);
	lctx.drawImage(trunk, center - trunk.width / 2, height - 2 * trunk.height);
	lctx.drawImage(stones, center - stones.width / 2, height - stones.height);
	lctx.drawImage(branch, 50, 0, branch.width - 50, 80, 0, 0, width, 200);
}

class flyingWood {
	constructor(from, type) {
		this.from = from;
		this.type = type;
		this.opacity = 1;
		this.y = height - lumber_body.height;
		this.x = center - trunk.width / 2;
		if (this.type === -1) this.x = -center - trunk.width / 2;
	}
	update() {
		this.y += 5;
		this.x += (this.type === -1 ? -20 : 20) * -this.from;
		lctx.save();
		lctx.globalAlpha = this.opacity;
		const image = this.type === 0 ? trunk : branch;
		if (this.type === -1) lctx.scale(-1, 1);
		lctx.drawImage(image, this.x, this.y, image.width, lumber_body.height / 2);
		lctx.restore();
		this.opacity -= 0.1;
		if (this.opacity <= 0) flyingStuff.delete(this);
	}
}

function drawBrokenLogs() {
	flyingStuff.forEach((wood) => {
		wood.update();
	});
}

function checkCollision(nextSide) {
	if (tree[0] === nextSide || tree[1] === nextSide) {
		gameOver = true;
	}
}

function chopTree(side) {
	checkCollision(side);
	// drawCuttingLumberjack(side);
	lumberSide = side;
	if (gameOver) return;
	flyingStuff.add(new flyingWood(side, tree[0]));
	const sound = tree.shift() !== 0 ? chopBranch : chopLog;
	sound.currentTime = 0;
	sound.play();
	score++;
	const nextType =
		tree[tree.length - 1] !== 0 ? 0 : Math.round(Math.random()) ? 1 : -1;
	tree.push(nextType);
}

function drawScore() {
	lctx.fillStyle = "black";
	lctx.font = "20px Arial";
	lctx.fillText(`Score: ${score}`, 10, 20);
}

function die() {
	if (firstLoss) htmlIsNot.play();
	drawDeadLumberjack();
	chopHead.currentTime = 0;
	chopHead.play();
	lctx.fillStyle = "white";
	lctx.font = "bold 50px Raleway";
	let str = "Game Over";
	let space = ctx.measureText(str).width / 2;
	lctx.fillText(str, width / 3 - space, height / 2);
	lctx.font = "30px Raleway";
	str = `You've made ${score} points`;
	space = ctx.measureText(str).width / 2;
	lctx.fillText(str, width / 3 - space, height / 2 + 50);
	str = "Press Space to restart";
	space = ctx.measureText(str).width / 2;
	lctx.fillText(str, width / 3 - space, height / 2 + 100);
}

function gameLoop() {
	lctx.clearRect(0, 0, width, height);
	if (gameOver) return die();
	drawTree();
	drawLumberjack();
	drawScore();
	drawBrokenLogs();
	requestAnimationFrame(gameLoop);
}

lumberSetup();
