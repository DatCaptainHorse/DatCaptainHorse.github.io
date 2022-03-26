let boxHolder, boxVisual;
let numberElements = [];
let numbers = [];

window.addEventListener("load", function() {
	boxHolder = document.getElementById("boxholder");
	boxVisual = document.getElementById("boxvisual");
	for (let i = 1; i <= 39; ++i)
		numbers.push(i);
});

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}

function getRandomNumber() {
	return numbers[getRandomInt(0, numbers.length)];
}

function addNumber() {
	let element = document.createElement("p");
	element.classList.add("numberbox");
	element.innerText = getRandomNumber();
	numberElements.push(element);
	boxHolder.appendChild(element);
}

function addRow() {
	boxVisual.style.minWidth = "1010px";
	if (numberElements.length >= 10)
		boxVisual.style.minHeight = (parseInt(boxVisual.style.minHeight) + 100) + "px";

	for (let i = 1; i <= 10; ++i)
		setTimeout(addNumber, 250 * i);
}

function rngAll() {
	numberElements.forEach(e => {
		e.innerText = getRandomNumber();
	});
}

function clearAll() {
	numberElements.forEach(e => {
		e.remove();
	});

	numberElements = [];

	boxVisual.style.minWidth = "100px";
	boxVisual.style.minHeight = "100px";
}