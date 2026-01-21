let video, inCanvas, outCanvas, roiCanvas, inCtx;
let ready = false;
let lastSent = 0;

/* ===== 画面ログ（Mac不要） ===== */
function logToScreen(msg) {
  const box = document.getElementById("debug");
  if (!box) return;
  box.textContent =
    `[${new Date().toLocaleTimeString()}] ${msg}\n` +
    box.textContent;
}

/* ===== カメラ起動 ===== */
function startCamera() {
  logToScreen("Camera start");

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
      logToScreen("Camera ready");
      requestAnimationFrame(loop);
    });
  }).catch(err => {
    logToScreen("Camera error: " + err);
  });
}

/* ===== MicroQR Finder 判定 ===== */
function checkMicroQRFinder(roiMat) {
  let gray = new cv.Mat();
  cv.cvtColor(roiMat, gray, cv.COLOR_RGBA2GRAY);

  let resized = new cv.Mat();
  cv.resize(gray, resized, new cv.Size(64, 64));

  let s = Math.floor(64 / 3);
  let roi = resized.roi(new cv.Rect(0, 0, s, s));

  let centerSum = 0, centerCnt = 0;
  let edgeSum = 0, edgeCnt = 0;

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      let v = roi.ucharPtr(y, x)[0];
      let isCenter =
        x > s * 0.3 && x < s * 0.7 &&
        y > s * 0.3 && y < s * 0.7;

      if (isCenter) {
        centerSum += v;
        centerCnt++;
      } else {
        edgeSum += v;
        edgeCnt++;
      }
    }
  }

  let centerAvg = centerSum / centerCnt;
  let edgeAvg = edgeSum / edgeCnt;

  let y = Math.floor(s / 2);
  let transitions = 0;
  let prev = roi.ucharPtr(y, 0)[0] > 128;
  for (let x = 1; x < s; x++) {
    let cur = roi.ucharPtr(y, x)[0] > 128;
    if (cur !== prev) transitions++;
    prev = cur;
  }

  gray.delete();
  resized.delete();
  roi.delete();

  let score = 0;
  if (centerAvg > 160) score += 0.4;
  if (edgeAvg < 120) score += 0.4;
  if (transitions <= 3) score += 0.2;

  return score;
}

/* ===== Bubble送信用（画面表示） ===== */
function sendResult(confidence, rect) {
  let now = Date.now();
  if (now - lastSent < 1500) return;
  lastSent = now;

  let payload = {
    type: "microqr",
    confidence: Number(confidence.toFixed(2)),
    bbox: {
      x: rect.x,
      y: rect.y,
      w: rect.width,
      h: rect.height
    },
    timestamp: now
  };

  logToScreen("Send: " + JSON.stringify(payload));
}

/* ===== メインループ ===== */
function loop() {
  if (!ready) {
    requestAnimationFrame(loop);
    return;
  }

  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);
  let src = cv.imread(inCanvas);

  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  let edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 150);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let display = src.clone();

  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let area = cv.contourArea(cnt);
    if (area < 1500) {
      cnt.delete();
      continue;
    }

    let approx = new cv.Mat();
    cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

    if (approx.rows === 4) {
      let rect = cv.boundingRect(cnt);
      let roiMat = src.roi(rect);

      roiCanvas.width = rect.width;
      roiCanvas.height = rect.height;
      cv.imshow(roiCanvas, roiMat);

      let confidence = checkMicroQRFinder(roiMat);

      if (confidence >= 0.6) {
        sendResult(confidence, rect);
      }

      let color = confidence >= 0.6
        ? new cv.Scalar(0, 255, 0, 255)
        : new cv.Scalar(255, 0, 0, 255);

      cv.rectangle(
        display,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        color,
        3
      );

      cv.putText(
        display,
        confidence >= 0.6
          ? `MicroQR (${confidence.toFixed(2)})`
          : "Not QR",
        new cv.Point(rect.x, rect.y - 8),
        cv.FONT_HERSHEY_SIMPLEX,
        0.7,
        color,
        2
      );

      roiMat.delete();
    }

    approx.delete();
    cnt.delete();
  }

  cv.imshow(outCanvas, display);

  src.delete();
  gray.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
  display.delete();

  requestAnimationFrame(loop);
}

/* ===== OpenCV初期化待ち ===== */
function waitForOpenCV() {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCV, 50);
    return;
  }
  cv.onRuntimeInitialized = startCamera;
}
waitForOpenCV();