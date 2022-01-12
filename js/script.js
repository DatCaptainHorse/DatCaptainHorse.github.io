var iframeHolder, minimapPointerHolder, webcamHolder, faceBtnHolder, fakeSidebarHolder, realSidebarHolder;
var minimapPointerOriginalHeight;
var webcamEnabled = false, faceEnabled = false, webcamStream;
var minimapDragging = false;

function setCanvasToBirb() {
	let face = document.getElementById("faceOut");
	let img = new Image();
	img.src = "./res/poster.png";
	img.onload = function() {
		face.getContext("2d").drawImage(img, 0, 0, face.width, face.height);
	};
}

window.addEventListener("load", function() {
	fakeSidebarHolder = document.getElementById("fakeSidebar");
	realSidebarHolder = document.getElementById("realSidebar");
	fakeSidebarHolder.addEventListener("animationiteration", sideberAnimationListener, false);
	iframeHolder = document.getElementById("exerciseFrame");
	minimapPointerHolder = document.getElementById("minimap-pointer");
	minimapPointerOriginalHeight = parseFloat(minimapPointerHolder.style.height);
	window.addEventListener("scroll", minimapScroll, true);
	minimapScroll();
	let minimapHolder = document.getElementById("minimap");
	minimapHolder.addEventListener("click", function(e) {
		if (!minimapDragging)
			minimapScrollTo(minimapHolder, e);
	});
	minimapHolder.addEventListener("mouseup", () => { minimapDragging = false });
	minimapHolder.addEventListener("mousedown", () => { minimapDragging = true });
	minimapHolder.addEventListener("mousemove", function(e) {
		if (minimapDragging)
			minimapScrollTo(minimapHolder, e);
	});
	webcamHolder = document.getElementById("webcam");
	setCanvasToBirb();
});

function setiFrame(whatTo) {
	iframeHolder.src = whatTo;
}

function remap(value, fromLow, fromHigh, toLow, toHigh) {
	return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow);
}

function sideberAnimationListener(ev) {
    if (ev.type == "animationiteration") {
		fakeSidebarHolder.style.animationPlayState = "paused";
		realSidebarHolder.style.animationPlayState = "paused";
	}
}

function sidebarToggle() {
    fakeSidebarHolder.style.animationPlayState = "running";
    realSidebarHolder.style.animationPlayState = "running";
}

// Squishing method
function minimapScroll() {
	let scrollLimit = document.documentElement.scrollHeight - document.documentElement.clientHeight;
	let scrollPercentage = (window.scrollY / scrollLimit) * 100.0;
	if (scrollPercentage >= minimapPointerOriginalHeight) {
		minimapPointerHolder.style.height = minimapPointerOriginalHeight + "%";
		minimapPointerHolder.style.top = "calc(" + scrollPercentage + "% - " + minimapPointerOriginalHeight + "%)";
	} else {
		minimapPointerHolder.style.top = "0%";
		minimapPointerHolder.style.height = "min(" + minimapPointerOriginalHeight + "%, " + scrollPercentage + "%)";
	}
}

function minimapScrollTo(elem, e) {
	let rect = elem.getBoundingClientRect()
	let scrollLimit = document.documentElement.scrollHeight - document.documentElement.clientHeight;
	let mapped = remap(e.clientY + minimapPointerOriginalHeight, rect.top, rect.bottom, 0, scrollLimit);
	window.scrollTo({ top: mapped, left: 0, behavior: minimapDragging ? "instant" : "smooth" });
}

var src, gray, cap, faces, classifier;
function OpenCVready() {
	cv['onRuntimeInitialized']=()=>{
		classifier = new cv.CascadeClassifier();
		// load pre-trained classifiers
		let faceCascadeFile = "haarcascade_frontalface_default.xml";
		cv.FS_createLazyFile("/", faceCascadeFile, faceCascadeFile, true, false);
		classifier.load(faceCascadeFile);
		faceBtnHolder = document.getElementById("faceButton");
		setButtonState(faceBtnHolder, true);
		faceBtnHolder.innerText = "Kasvojentunnistus päälle";
	};
}

function webcamToggle(clicker) {
	if (!webcamEnabled && this.navigator.mediaDevices && this.navigator.mediaDevices.getUserMedia) {
		this.navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
			webcamStream = stream;
			webcamHolder.srcObject = webcamStream;
			webcamEnabled = true;
			setButtonState(clicker, false);
			clicker.innerText = "Kamera pois";
		}).catch(function (err) {
			console.error(err);
			alert("Kamera kuoli");
			webcamEnabled = false;
			setButtonState(clicker, true);
			clicker.innerText = "Kamera päälle";
		});
	} else if (webcamEnabled) {
		if (faceEnabled)
			faceToggle(faceBtnHolder);

		webcamEnabled = false;
		webcamStream.getTracks().forEach(function (track) {
			track.stop();
		});
		webcamHolder.load(); // Resets poster
		setButtonState(clicker, true);
		clicker.innerText = "Kamera päälle";
	}
}

function setButtonState(btn, state) {
	if (state) {
		if (btn.classList.contains("btn-red")) {
			btn.classList.remove("btn-red");
			btn.classList.add("btn-green");
		}
	} else {
		if (btn.classList.contains("btn-green")) {
			btn.classList.remove("btn-green");
			btn.classList.add("btn-red");
		}
	}
}

async function delayedText(textElement, text, delay) {
	let old = textElement.innerText;
	textElement.innerText = text;
	await new Promise(r => setTimeout(r, delay * 1000));
	textElement.innerText = old;
}

async function faceToggle() {
	if (!faceEnabled && webcamEnabled) {
		faceEnabled = true;
		src = new cv.Mat(webcamHolder.height, webcamHolder.width, cv.CV_8UC4);
		gray = new cv.Mat();
		cap = new cv.VideoCapture(webcamHolder);
		faces = new cv.RectVector();
		setTimeout(faceRecognize, 0);
		setButtonState(faceBtnHolder, false);
		faceBtnHolder.innerText = "Kasvojentunnistus pois";
	} else if (faceEnabled && webcamEnabled) {
		faceEnabled = false;
		setButtonState(faceBtnHolder, true);
		faceBtnHolder.innerText = "Kasvojentunnistus päälle";
		setCanvasToBirb();
	} else if (!webcamEnabled && !faceEnabled) {
		setButtonState(faceBtnHolder, false);
		await delayedText(faceBtnHolder, "Kameran pitää olla päällä", 3);
		setButtonState(faceBtnHolder, true);
		setCanvasToBirb();
	}
};

const recogFPS = 15.0;
function faceRecognize() {
	try {
		if (!webcamEnabled || !faceEnabled) {
			src.delete();
			gray.delete();
			faces.delete();
			return;
		}
		let begin = Date.now();
		cap.read(src);
		cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
		classifier.detectMultiScale(gray, faces, 1.3, 5, 0);
		for (let i = 0; i < faces.size(); ++i) {
			let face = faces.get(i);
			let point1 = new cv.Point(face.x, face.y);
			let point2 = new cv.Point(face.x + face.width, face.y + face.height);
			cv.rectangle(src, point1, point2, [255, 0, 0, 255], 3);
		}
		cv.imshow('faceOut', src);
		let delay = 1000.0 / recogFPS - (Date.now() - begin);
		setTimeout(faceRecognize, delay);
	} catch (err) {
		faceToggle();
		alert("Kasvojentunnistus toimii vain oikealla palvelimella (esim. nginx)");
	}
};