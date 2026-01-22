let cap, src, gray;

(async () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  try {
    // ① カメラ起動
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    await video.play();

    // ② フレームが本当に来るまで待つ
    const waitForReady = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        startOpenCV(video, canvas);
      } else {
        requestAnimationFrame(waitForReady);
      }
    };
    waitForReady();

  } catch (e) {
    console.error("camera init failed", e);
  }
})();

function startOpenCV(video, canvas) {
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