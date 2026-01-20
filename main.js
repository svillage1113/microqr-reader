let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function onOpenCvReady() {
  requestAnimationFrame(processFrame);
}

function processFrame() {
  if (video.videoWidth === 0) {
    requestAnimationFrame(processFrame);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  cv.imshow(canvas, gray);

  src.delete();
  gray.delete();

  requestAnimationFrame(processFrame);
}

// OpenCV.js の ready 待ち
if (typeof cv !== "undefined") {
  cv["onRuntimeInitialized"] = onOpenCvReady;
}