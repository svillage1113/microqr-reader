let cap, src, gray;

function onOpenCvReady() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  // ★ ここが重要：video のサイズが確定するのを待つ
  video.addEventListener("loadedmetadata", () => {

    const width  = video.videoWidth;
    const height = video.videoHeight;

    // 念のため canvas サイズも合わせる
    canvas.width  = width;
    canvas.height = height;

    src  = new cv.Mat(height, width, cv.CV_8UC4);
    gray = new cv.Mat(height, width, cv.CV_8UC1);

    cap = new cv.VideoCapture(video);

    requestAnimationFrame(processFrame);
  });
}

function processFrame() {
  cap.read(src);
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.imshow("canvas", gray);
  requestAnimationFrame(processFrame);
}