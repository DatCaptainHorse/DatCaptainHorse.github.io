var waveEmitterHolder, waveParticlesAlive = [];
var emitInterval = 1.5, emitCount = 25, updateInterval = 0.01, particleMaxRange = 350.0;
var keepEmitting = false;

window.addEventListener("load", function() {
    waveEmitterHolder = document.getElementById("waveEmitter");
    keepEmitting = true;
    setTimeout(emitParticles, emitInterval * 1000.0);
    setTimeout(updateParticles, updateInterval * 1000.0);
});

function remap(value, fromLow, fromHigh, toLow, toHigh) {
    return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow);
}

function getRandomInclusive(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function emitParticles() {
    if (!keepEmitting)
        return;

    for (let i = 0; i < emitCount; ++i) {
        let particle = document.createElement("div");
        particle.id = "radiowave";

        let x = 10.0 * Math.cos(2 * Math.PI * i / emitCount);
        let y = 10.0 * Math.sin(2 * Math.PI * i / emitCount);

        particle.style.top = y + "px";
        particle.style.left = x + "px";

        waveEmitterHolder.appendChild(particle);
        waveParticlesAlive.push(particle);
    }

    setTimeout(emitParticles, emitInterval * 1000.0);
}

function updateParticles() {
    doClear = false
    waveParticlesAlive.forEach(particle => {
        particle.style.top = (parseFloat(particle.style.top) * 1.03) + "px";
        particle.style.left = (parseFloat(particle.style.left) * 1.03) + "px";
        if (parseFloat(particle.style.top) >= particleMaxRange || parseFloat(particle.style.top) <= -particleMaxRange ||
            parseFloat(particle.style.left) >= particleMaxRange || parseFloat(particle.style.left) <= -particleMaxRange)
                doClear = true;
    });

    if (doClear) {
        toRemove = waveParticlesAlive.splice(0, emitCount);
        toRemove.forEach(particle => { 
            particle.remove();
        });
    }

    setTimeout(updateParticles, updateInterval * 1000.0);
}