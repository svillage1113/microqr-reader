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
  });
}

/* ===== メインループ ===== */
function loop() {
  if (!ready) {
    requestAnimationFrame(loop);
    return;
  }

  // video → input canvas
  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);

  let src = cv.imread(inCanvas);

  // ① グレースケール
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // ② コントラスト強調
  let enhanced = new cv.Mat();
  cv.normalize(gray, enhanced, 0, 255, cv.NORM_MINMAX);

  // ③ ぼかし
  let blurred = new cv.Mat();
  cv.GaussianBlur(
    enhanced,
    blurred,
    new cv.Size(5, 5),
    0,
    0,
    cv.BORDER_DEFAULT
  );

  // ④ Canny
  let edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  // ⑤ カーネル作成（3x3）
  let kernel = cv.Mat.ones(3, 3, cv.CV_8U);

  // ⑥ 膨張 → 収縮（クロージング）
  let morphed = new cv.Mat();
  cv.dilate(edges, morphed, kernel);
  cv.erode(morphed, morphed, kernel);

  // ⑦ 表示
  cv.imshow(outCanvas, morphed);

  // メモリ解放
  src.delete();
  gray.delete();
  enhanced.delete();
  blurred.delete();
  edges.delete();
  kernel.delete();
  morphed.delete();

  requestAnimationFrame(loop);
}

/* ===== OpenCV 初期化待ち ===== */
function waitForOpenCV() {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCV, 50);
    return;
  }

  cv.onRuntimeInitialized = () => {
    startCamera();
  };
}

waitForOpenCV();