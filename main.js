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
    alert("カメラ起動エラー: " + err);
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

  // ③ グレースケール化
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // ④ コントラスト強調（正規化）
  let enhanced = new cv.Mat();
  cv.normalize(gray, enhanced, 0, 255, cv.NORM_MINMAX);

  // ⑤ 表示用に RGBA に戻す
  let display = new cv.Mat();
  cv.cvtColor(enhanced, display, cv.COLOR_GRAY2RGBA);

  // ⑥ output canvas に描画
  cv.imshow(outCanvas, display);

  // ⑦ メモリ解放（重要）
  src.delete();
  gray.delete();
  enhanced.delete();
  display.delete();

  requestAnimationFrame(loop);
}

/* ===== OpenCV.js 完全初期化待ち ===== */
function waitForOpenCV() {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCV, 50);
    return;
  }

  cv.onRuntimeInitialized = () => {
    console.log("OpenCV fully initialized");
    startCamera();
  };
}

waitForOpenCV();