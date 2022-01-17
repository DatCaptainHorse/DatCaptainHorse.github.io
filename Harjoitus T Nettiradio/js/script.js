var waveEmitterHolder, waveParticlesAlive = [], waveEmitTimeout, waveUpdateTimeout;
var emitInterval = 1.5, emitCount = 25, updateInterval = 0.01, particleMaxRange = 350.0;
var currentStationHolder, audioSourceHolder, stationlistHolder, toggleButtonHolder, repeatButtonHolder, shuffleButtonHolder, trackTimeHolder;
var documentHidden = false, isRadioPlaying = false, isShuffleOn = false;

window.addEventListener("load", function() {
    waveEmitterHolder = document.getElementById("waveEmitter");
    waveUpdateTimeout = setTimeout(updateParticles, updateInterval * 1000.0);
    document.addEventListener("visibilitychange", onVisibilityChange);
    currentStationHolder = document.getElementById("currentStation");
    currentStationHolder.addEventListener("animationiteration", stationTimeSwitch);
    trackTimeHolder = document.getElementById("trackTime");
    audioSourceHolder = document.getElementById("audioSource");
    audioSourceHolder.loop = false;
    audioSourceHolder.addEventListener("ended", onTrackEnd);
    audioSourceHolder.onplaying = onTrackPlay;
    stationlistHolder = document.getElementById("stationList");
    changeStation(0);
    toggleButtonHolder = document.getElementById("toggleButton");
    repeatButtonHolder = document.getElementById("repeatButton");
    shuffleButtonHolder = document.getElementById("shuffleButton");
});

function onTrackPlay() {
    let time = Math.round(audioSourceHolder.currentTime);
    let minutes = Math.floor(time / 60).toString().padStart(2, "0");
    let seconds = (time % 60).toString().padStart(2, "0");

    let dur = Math.round(audioSourceHolder.duration);
    let durMin = Math.floor(dur / 60).toString().padStart(2, "0");
    let durSec = (dur % 60).toString().padStart(2, "0");

    trackTimeHolder.innerHTML = `[${minutes}:${seconds} - ${durMin}:${durSec}]`;
    if (isRadioPlaying)
        setTimeout(onTrackPlay, 1000.0);
}

function stationTimeSwitch() {
    if (trackTimeHolder.classList.contains("hidden")) {
        trackTimeHolder.classList.remove("hidden");
        currentStationHolder.classList.add("hidden");
    } else {
        trackTimeHolder.classList.add("hidden");
        currentStationHolder.classList.remove("hidden");
    }
}

function onVisibilityChange() {
    if (document.hidden) {
        documentHidden = true;
        clearTimeout(waveEmitTimeout);
        clearTimeout(waveUpdateTimeout);
    } else {
        documentHidden = false;
        waveEmitTimeout = setTimeout(emitParticles, emitInterval * 1000.0);
        waveUpdateTimeout = setTimeout(updateParticles, updateInterval * 1000.0);
    }
}

function remap(value, fromLow, fromHigh, toLow, toHigh) {
    return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow);
}

function getRandomInclusive(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function emitParticles() {
    if (!isRadioPlaying)
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

    if (!isRadioPlaying)
        return;

    waveEmitTimeout = setTimeout(emitParticles, emitInterval * 1000.0);
}

function updateParticles() {   
    if (documentHidden)
        return;
         
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

    if (documentHidden)
        return;

    waveUpdateTimeout = setTimeout(updateParticles, updateInterval * 1000.0);
}

function onTrackEnd() {
    if (isRadioPlaying && isShuffleOn && !audioSourceHolder.loop) {
        let nextStation = "0";
        while (nextStation == stationlistHolder.selectedIndex)
            nextStation = Math.floor(Math.random() * stationlistHolder.length);

        changeStation(nextStation);
    } else if (isRadioPlaying && !isShuffleOn && !audioSourceHolder.loop)
        toggleRadio();
}

function toggleShuffle() {
    if (!isShuffleOn) {
        shuffleButtonHolder.style.backgroundColor = "rgb(72, 72, 72)";
        isShuffleOn = true;
        if (audioSourceHolder.loop)
            toggleRepeat();
    } else {
        shuffleButtonHolder.style.backgroundColor = "rgb(32, 32, 32)";
        isShuffleOn = false;
    }
}

function toggleRepeat() {
    if (!audioSourceHolder.loop) {
        repeatButtonHolder.style.backgroundColor = "rgb(72, 72, 72)";
        audioSourceHolder.loop = true;
        if (isShuffleOn)
            toggleShuffle();
    } else {
        repeatButtonHolder.style.backgroundColor = "rgb(32, 32, 32)";
        audioSourceHolder.loop = false;
    }
}

function toggleRadio() {
    if (!isRadioPlaying) {
        toggleButtonHolder.innerHTML = "Stop";
        toggleButtonHolder.style.backgroundColor = "rgb(72, 72, 72)";
        audioSourceHolder.play();
        isRadioPlaying = true;
        waveEmitTimeout = setTimeout(emitParticles, emitInterval * 1000.0);
    } else {
        toggleButtonHolder.innerHTML = "Play";
        toggleButtonHolder.style.backgroundColor = "rgb(32, 32, 32)";
        audioSourceHolder.pause();
        audioSourceHolder.currentTime = 0;
        isRadioPlaying = false;
        clearTimeout(waveEmitTimeout);
    }
}

function changeStation(idx) {
    stationlistHolder.selectedIndex = "" + idx + "";
    currentStationHolder.innerHTML = stationlistHolder.options[stationlistHolder.selectedIndex].innerHTML;
    audioSourceHolder.src = stationlistHolder.value;
    audioSourceHolder.load();
    audioSourceHolder.currentTime = 0;
    if (isRadioPlaying)
        audioSourceHolder.play();
}