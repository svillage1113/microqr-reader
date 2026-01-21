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
  cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0);

  // ④ Canny
  let edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  // ⑤ 膨張 → 収縮
  let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  let morphed = new cv.Mat();
  cv.dilate(edges, morphed, kernel);
  cv.erode(morphed, morphed, kernel);

  // ⑥ 輪郭検出
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    morphed,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  // ⑦ 結果表示用（カラー）
  let display = src.clone();

  // ⑧ 四角形を探す
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);

    let area = cv.contourArea(cnt);
    if (area < 1000) {
      cnt.delete();
      continue;
    }

    let approx = new cv.Mat();
    let peri = cv.arcLength(cnt, true);
    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

    // ★ 頂点が4つ → 四角形候補
    if (approx.rows === 4) {
      let color = new cv.Scalar(255, 0, 0, 255); // 赤
      cv.drawContours(display, contours, i, color, 3);
    }

    approx.delete();
    cnt.delete();
  }

  // ⑨ 表示
  cv.imshow(outCanvas, display);

  // メモリ解放
  src.delete();
  gray.delete();
  enhanced.delete();
  blurred.delete();
  edges.delete();
  kernel.delete();
  morphed.delete();
  contours.delete();
  hierarchy.delete();
  display.delete();

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