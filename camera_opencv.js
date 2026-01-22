let cap, src, gray;
let video, canvas;

(async () => {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");

  // カメラ起動
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  await video.play();
})();

// ★ OpenCV が完全に初期化されたらここが呼ばれる
function startWhenOpenCVReady() {
  const waitVideo = () => {
    if (video.videoWidth > 0 && video.readyState >= 2) {
      initOpenCV();
    } else {
      requestAnimationFrame(waitVideo);
    }
  };
  waitVideo();
}

function initOpenCV() {
  const w = video.videoWidth;
  const h = video.videoHeight;

  canvas.width = w;
  canvas.height = h;

  src  = new cv.Mat(h, w, cv.CV_8UC4);
  gray = new cv.Mat(h, w, cv.CV_8UC1);

  cap = new cv.VideoCapture(video);
  requestAnimationFrame(loop);
}

function loop() {
  cap.read(src);

  if (!src.empty()) {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.imshow("canvas", gray);
  }

  requestAnimationFrame(loop);
}