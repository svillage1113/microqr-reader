let cap, src, gray;

function onOpenCvReady() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
  gray = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC1);

  cap = new cv.VideoCapture(video);

  requestAnimationFrame(processFrame);
}

function processFrame() {
  cap.read(src);
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.imshow("canvas", gray);
  requestAnimationFrame(processFrame);
}