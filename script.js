const form = document.getElementById("contact-form");
const button = document.getElementById("submitButton");
const fName = document.getElementById("fName");
const fEmail = document.getElementById("fEmail");
const fMessage = document.getElementById("fMessage");

form.addEventListener("submit", (e) => {
	e.preventDefault();
	if (fName.value === "") {
		errorField(fName);
	} else if (fEmail.value === "") {
		errorField(fEmail);
	} else if (fMessage.value === "") {
		errorField(fMessage);
	} else {
		button.classList.add("loading");
		button.disabled = true;

		setTimeout(() => {
			button.classList.remove("loading");
			button.classList.add("sent");
			setTimeout(() => {
				button.classList.remove("sent");
				button.disabled = false;

				fName.value = "";
				fEmail.value = "";
				fMessage.value = "";
			}, 3000);
		}, 2000);
	}
});

const timeouts = {};
function errorField(field) {
	if (timeouts[field.id]) {
		clearTimeout(timeouts[field.id]);
	}
	field.classList.add("error");
	timeouts[field.id] = setTimeout(() => {
		field.classList.remove("error");
	}, 5000);
}

const wordLengths = [];
let words = document.querySelectorAll(".word");
words.forEach((word) => {
	let letters = word.textContent.split("");
	wordLengths.push(letters.length);
	word.textContent = "";
	letters.forEach((letter) => {
		let span = document.createElement("span");
		span.textContent = letter === " " ? "\u00A0" : letter;
		span.className = "letter";
		word.append(span);
	});
});

const wordDelay = [];
for (let i = 0; i < words.length; i++) {
	const next = i == words.length - 1 ? 0 : i + 1;
	wordDelay[i] = (wordLengths[next] - wordLengths[i]) / 2;
}

let wId = 0;
let maxWordIndex = words.length - 1;
words[wId].style.opacity = "1";

let rotateText = () => {
	let currentWord = words[wId];
	let nextWord = wId === maxWordIndex ? words[0] : words[wId + 1];

	Array.from(currentWord.children).forEach((letter, i) => {
		setTimeout(() => {
			letter.className = "letter out";
		}, (Math.max(0, wordDelay[wId]) + i) * 80);
	});

	nextWord.style.opacity = "1";
	Array.from(nextWord.children).forEach((letter, i) => {
		letter.className = "letter behind";
		setTimeout(() => {
			letter.className = "letter in";
		}, (Math.max(0, -wordDelay[wId]) + i + 4) * 80);
	});
	wId = wId === maxWordIndex ? 0 : wId + 1;
};

rotateText();
setInterval(rotateText, 3500);
