let video, inCanvas, outCanvas, inCtx;
let ready = false;

/* ===== カメラ起動 ===== */
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
      inCanvas.width  = outCanvas.width  = video.videoWidth;
      inCanvas.height = outCanvas.height = video.videoHeight;
      ready = true;
      requestAnimationFrame(loop);
    });
  }).catch(err => {
    alert("カメラエラー: " + err);
  });
}

/* ===== メインループ ===== */
function loop() {
  if (!ready) {
    requestAnimationFrame(loop);
    return;
  }

  // ① video → input canvas
  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);

  // ② input canvas → OpenCV
  let src = cv.imread(inCanvas);

  // ③ グレースケール
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // ④ コントラスト強調
  let enhanced = new cv.Mat();
  cv.normalize(gray, enhanced, 0, 255, cv.NORM_MINMAX);

  // ⑤ ぼかし（Canny必須）
  let blurred = new cv.Mat();
  cv.GaussianBlur(
    enhanced,
    blurred,
    new cv.Size(5, 5),
    0,
    0,
    cv.BORDER_DEFAULT
  );

  // ⑥ エッジ検出
  let edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  // ⑦ ★そのまま表示（超重要）
  cv.imshow(outCanvas, edges);

  // ⑧ メモリ解放
  src.delete();
  gray.delete();
  enhanced.delete();
  blurred.delete();
  edges.delete();

  requestAnimationFrame(loop);
}

/* ===== OpenCV.js 初期化待ち ===== */
function waitForOpenCV() {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCV, 50);
    return;
  }

  cv.onRuntimeInitialized = () => {
    console.log("OpenCV ready");
    startCamera();
  };
}

waitForOpenCV();