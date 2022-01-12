var device, vLightHolder, aSwitchHolder;
var randomCounter = 0;

window.addEventListener("load", function() {
    device = document.getElementById("device");
    device.addEventListener("animationiteration", deviceAnimationListener, false);
    vLightHolder = document.getElementById("visualizedLights");
    aSwitchHolder = this.document.getElementById("lightSwitches");
});

function lightsOn() {
    var vLights = vLightHolder.getElementsByClassName("visualLight");
    for (var i = 0; i < vLights.length; ++i) {
        if (!vLights[i].classList.contains("lightOn"))
            vLights[i].classList.add("lightOn");
    }

    var aSwitches = aSwitchHolder.getElementsByClassName("lightSwitch");
    for (var i = 0; i < aSwitches.length; ++i) {
        if (!aSwitches[i].classList.contains("switchOn"))
            aSwitches[i].classList.add("switchOn");
    }
}

function lightsOff() {
    var vLights = vLightHolder.getElementsByClassName("visualLight");
    for (var i = 0; i < vLights.length; ++i) {
        if (vLights[i].classList.contains("lightOn"))
            vLights[i].classList.remove("lightOn");
    }

    var aSwitches = aSwitchHolder.getElementsByClassName("lightSwitch");
    for (var i = 0; i < aSwitches.length; ++i) {
        if (aSwitches[i].classList.contains("switchOn"))
            aSwitches[i].classList.remove("switchOn");
    }
}

function lightOn(src, which) {
    var l = document.getElementById(which);
    if (!l.classList.contains("lightOn")) {
        l.classList.add("lightOn");
        src.classList.add("switchOn");
    }
}

function lightOff(src, which) {
    var l = document.getElementById(which);
    if (l.classList.contains("lightOn")) {
        l.classList.remove("lightOn");
        src.classList.remove("switchOn");
    }
}

function lightToggle(src, which) {
    if (document.getElementById(which).classList.contains("lightOn"))
        lightOff(src, which);
    else
        lightOn(src, which);
}

function addLight(name, x, y) {
    var newLight = document.createElement("div");
    newLight.classList.add("visualLight");
    newLight.style.top = x + "%";
    newLight.style.left = y + "%";
    newLight.id = name;
    vLightHolder.appendChild(newLight);

    var newSwitch = document.createElement("div");
    newSwitch.classList.add("lightSwitch");
    newSwitch.onclick = function() { lightToggle(this, name) };
    newSwitch.innerHTML = "<a>"+ name +"</a>";
    aSwitchHolder.appendChild(newSwitch);
}

function addRandomLight() {
    rX = Math.floor(Math.random() * 95 + 1);
    rY = Math.floor(Math.random() * 95 + 1);
    addLight("random" + randomCounter, rX, rY);
    ++randomCounter;
}

function lightColorCycle() {
    var vLights = vLightHolder.getElementsByClassName("visualLight");
    var aSwitches = aSwitchHolder.getElementsByClassName("lightSwitch");

    var r = 0.0, g = 0.0, b = 0.0;
    for (var longTime = 0; longTime < 100000; ++longTime) {
        for (var i = 0; i < vLights.length; ++i) {
            if (vLights[i].classList.contains("lightOn")) {
                vLights[i].style.backgroundColor = "rgb(" + r + g + b + ")";
            }
        }

        for (var i = 0; i < aSwitches.length; ++i) {
            if (aSwitches[i].classList.contains("switchOn")) {
                vLights[i].style.backgroundColor = "rgb(" + r + g + b + ")";
            }
        }

        if (r < 1.0) r += 0.1; else r = 0.0;
        if (g < 1.0) g += 0.2; else g = 0.0;
        if (b < 1.0) b += 0.3; else b = 0.0;
    }
}

function deviceAnimationListener(ev) {
    if (ev.type == "animationiteration")
        device.style.animationPlayState = "paused";
}

function deviceAnimationToggle() {
    device.style.animationPlayState = "running";
}