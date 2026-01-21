let video, inCanvas, outCanvas, roiCanvas, inCtx;
let ready = false;

/* ===== カメラ起動 ===== */
function startCamera() {
  video = document.getElementById("video");
  inCanvas = document.getElementById("input");
  outCanvas = document.getElementById("output");
  roiCanvas = document.getElementById("roi");
  inCtx = inCanvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  }).then(stream => {
    video.srcObject = stream;
    video.play();

    video.addEventListener("loadedmetadata", () => {
      inCanvas.width =
      outCanvas.width =
      roiCanvas.width = video.videoWidth;

      inCanvas.height =
      outCanvas.height =
      roiCanvas.height = video.videoHeight;

      ready = true;
      requestAnimationFrame(loop);
    });
  });
}

/* ===== MicroQR 内部パターン検査 ===== */
function checkMicroQRPattern(roiMat) {
  // グレースケール
  let gray = new cv.Mat();
  cv.cvtColor(roiMat, gray, cv.COLOR_RGBA2GRAY);

  // 64x64 に正規化
  let resized = new cv.Mat();
  cv.resize(gray, resized, new cv.Size(64, 64));

  // 左上 1/3 領域
  let size = Math.floor(64 / 3);
  let roi = resized.roi(new cv.Rect(0, 0, size, size));

  // 横方向スキャン（中央ライン）
  let y = Math.floor(size / 2);
  let transitions = 0;
  let prev = roi.ucharPtr(y, 0)[0] > 128;

  for (let x = 1; x < size; x++) {
    let cur = roi.ucharPtr(y, x)[0] > 128;
    if (cur !== prev) transitions++;
    prev = cur;
  }

  // 後始末
  gray.delete();
  resized.delete();
  roi.delete();

  // 黒→白→黒 = 遷移2回以上
  let confidence = Math.min(transitions / 4, 1.0);
  return confidence;
}

/* ===== メインループ ===== */
function loop() {
  if (!ready) {
    requestAnimationFrame(loop);
    return;
  }

  // video → input
  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);

  let src = cv.imread(inCanvas);

  // 前処理
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  let enhanced = new cv.Mat();
  cv.normalize(gray, enhanced, 0, 255, cv.NORM_MINMAX);

  let blurred = new cv.Mat();
  cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0);

  let edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  let morphed = new cv.Mat();
  cv.dilate(edges, morphed, kernel);
  cv.erode(morphed, morphed, kernel);

  // 輪郭検出
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(morphed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let display = src.clone();
  let roiShown = false;

  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let area = cv.contourArea(cnt);
    if (area < 1500) {
      cnt.delete();
      continue;
    }

    let approx = new cv.Mat();
    let peri = cv.arcLength(cnt, true);
    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);

    if (approx.rows === 4 && !roiShown) {
      let rect = cv.boundingRect(cnt);
      let roiMat = src.roi(rect);

      // ROI表示
      roiCanvas.width = rect.width;
      roiCanvas.height = rect.height;
      cv.imshow(roiCanvas, roiMat);

      // ★ 内部パターン検査
      let confidence = checkMicroQRPattern(roiMat);

      // 結果表示
      let label = confidence > 0.5 ? "MicroQR?" : "Not QR";
      cv.putText(
        display,
        `${label} (${confidence.toFixed(2)})`,
        new cv.Point(rect.x, rect.y - 10),
        cv.FONT_HERSHEY_SIMPLEX,
        0.8,
        new cv.Scalar(0, 255, 0, 255),
        2
      );

      cv.rectangle(
        display,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        new cv.Scalar(255, 0, 0, 255),
        3
      );

      roiMat.delete();
      roiShown = true;
    }

    approx.delete();
    cnt.delete();
  }

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