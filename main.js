let video, inCanvas, outCanvas, inCtx;
let ready = false;

function startCamera() {
  video = document.getElementById("video");
  inCanvas = document.getElementById("input");
  outCanvas = document.getElementById("output");
  inCtx = inCanvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  }).then(stream => {
    video.srcObject = stream;
    video.play();

    video.addEventListener("loadedmetadata", () => {
      inCanvas.width = outCanvas.width = video.videoWidth;
      inCanvas.height = outCanvas.height = video.videoHeight;
      ready = true;
      requestAnimationFrame(loop);
    });
  });
}

function loop() {
  if (!ready) {
    requestAnimationFrame(loop);
    return;
  }

  // video → input canvas
  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);

  // input canvas → OpenCV
  let src = cv.imread(inCanvas);

  // 何もしないで output に出す
  cv.imshow(outCanvas, src);

  src.delete();
  requestAnimationFrame(loop);
}

// ★ OpenCV 完全初期化を待つ（超重要）
function waitForOpenCV() {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCV, 50);
    return;
  }

  cv.onRuntimeInitialized = () => {
    console.log("OpenCV fully initialized");
    startCamera();
  };
}

waitForOpenCV();