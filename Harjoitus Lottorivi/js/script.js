let boxHolder;
let numberElements = [];

window.addEventListener("load", function() {
    boxHolder = document.getElementById("boxholder");
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function addRandomNumber() {
    let element = document.createElement("p");
    element.classList.add("numberbox");
    element.innerText = "" + getRandomInt(1, 10) + "";
    numberElements.push(element);
    boxHolder.appendChild(element);
}

function addRNGrow() {
    boxHolder.style.minWidth = "510px";
    if (numberElements.length >= 5)
        boxHolder.style.minHeight = (parseInt(boxHolder.style.minHeight) + 100) + "px";

    for (let i = 1; i <= 5; ++i)
        setTimeout(addRandomNumber, 250 * i);
}

function rngAll() {
    numberElements.forEach(e => {
        e.innerText = "" + getRandomInt(1, 10) + "";
    });
}