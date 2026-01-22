let cap, src, gray;

function onOpenCvReady() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  // video が「実際に再生可能」になるまで待つ
  const waitForVideo = () => {
    if (video.readyState >= 2 && video.videoWidth > 0) {
      startOpenCV(video, canvas);
    } else {
      requestAnimationFrame(waitForVideo);
    }
  };

  waitForVideo();
}

function startOpenCV(video, canvas) {
  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  src  = new cv.Mat(height, width, cv.CV_8UC4);
  gray = new cv.Mat(height, width, cv.CV_8UC1);

  cap = new cv.VideoCapture(video);

  requestAnimationFrame(processFrame);
}

function processFrame() {
  if (!cap) return;

  cap.read(src);

  // ★ デバッグ用：本当にフレームが来ているか
  if (src.empty()) {
    requestAnimationFrame(processFrame);
    return;
  }

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.imshow("canvas", gray);

  requestAnimationFrame(processFrame);
}