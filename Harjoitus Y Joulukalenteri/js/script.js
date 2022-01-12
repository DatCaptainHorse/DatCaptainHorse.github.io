var snowflakeEmitterHolder, snowAreaHolder, snowflakesAlive = [], snowflakesOriginalLefts = [], snowflakeOffsets = [];
var emitInterval = 0.5, aliveLimit = 100, updateInterval = 0.01;
var keepEmitting = false;
var time = 0.0;

window.addEventListener("load", function() {
    snowflakeEmitterHolder = document.getElementById("snowEmitter");
    snowAreaHolder = document.getElementById("snowArea");
    keepEmitting = true;
    setTimeout(emitSnow, emitInterval * 1000.0);
    setTimeout(updateSnow, updateInterval * 1000.0);
});

function remap(value, fromLow, fromHigh, toLow, toHigh) {
	return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow);
}

function emitSnow() {
    if (!keepEmitting)
        return;

    if (snowflakesAlive.length < aliveLimit) {
        let snow = document.createElement("img");
        snow.id = "snowflake";
        snow.src = "./res/snowflake.png";
        snow.style.top = (Math.random() * parseFloat(snowflakeEmitterHolder.style.height)) + parseFloat(snowflakeEmitterHolder.style.top) + "%";
        snow.style.left = (Math.random() * parseFloat(snowflakeEmitterHolder.style.width)) + "%";

        snowAreaHolder.appendChild(snow);

        snowflakesAlive.push(snow);
        snowflakesOriginalLefts.push(snow.style.left);
        snowflakeOffsets.push(Math.random() * 10.0);
    }

    setTimeout(emitSnow, emitInterval * 1000.0);
}

function updateSnow() {
    let removeIndexes = [];
    for (let i = 0; i < snowflakesAlive.length; ++i) {
        snowflakesAlive[i].style.left = (parseFloat(snowflakesOriginalLefts[i])+ Math.sin(time + snowflakeOffsets[i])) + "%";
        snowflakesAlive[i].style.top = (parseFloat(snowflakesAlive[i].style.top) + 0.1) + "%";
        if (parseFloat(snowflakesAlive[i].style.top) >= 100.0)
            removeIndexes.push(i);
    }

    removeIndexes.forEach(idx => {
        snowflakesAlive[idx].remove();
        snowflakesAlive.splice(idx, 1);
        snowflakesOriginalLefts.splice(idx, 1);
        snowflakeOffsets.splice(idx, 1);
    });

    time += 0.025;

    setTimeout(updateSnow, updateInterval * 1000.0);
}