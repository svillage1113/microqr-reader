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

/* ===== メインループ ===== */
function loop() {
  if (!ready) {
    requestAnimationFrame(loop);
    return;
  }

  // video → input
  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);

  let src = cv.imread(inCanvas);

  // 前処理（今まで通り）
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
  cv.findContours(
    morphed,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

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
      // 赤枠
      cv.drawContours(
        display,
        contours,
        i,
        new cv.Scalar(255, 0, 0, 255),
        3
      );

      // ★ ROI 切り出し
      let rect = cv.boundingRect(cnt);
      let roi = src.roi(rect);

      roiCanvas.width = rect.width;
      roiCanvas.height = rect.height;
      cv.imshow(roiCanvas, roi);

      roi.delete();
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