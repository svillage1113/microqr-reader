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

  // video → canvas
  ctx.drawImage(video, 0, 0);

  // canvas → OpenCV
  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  let rgba = new cv.Mat();

  // RGBA → GRAY
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // GRAY → RGBA（←これが重要）
  cv.cvtColor(gray, rgba, cv.COLOR_GRAY2RGBA);

  // 描画
  cv.imshow(canvas, rgba);

  // メモリ解放
  src.delete();
  gray.delete();
  rgba.delete();

  requestAnimationFrame(processFrame);
}

// OpenCV.js ready 待ち
if (typeof cv !== "undefined") {
  cv["onRuntimeInitialized"] = onOpenCvReady;
}