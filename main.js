let video, canvas, ctx;
let streaming = false;

function onOpenCvReady() {
  console.log("OpenCV ready");
  startCamera();
}

async function startCamera() {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  video.addEventListener("loadedmetadata", () => {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    streaming = true;
    requestAnimationFrame(processFrame);
  });
}

function processFrame() {
  if (!streaming) return;

  // ① video → canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // ② canvas → OpenCV Mat
  let src = cv.imread(canvas);

  // ③ グレースケール
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // ④ 二値化
  let bin = new cv.Mat();
  cv.threshold(gray, bin, 128, 255, cv.THRESH_BINARY);

  // ⑤ 結果を canvas に戻す
  cv.imshow(canvas, bin);

  // メモリ解放（超重要）
  src.delete();
  gray.delete();
  bin.delete();

  requestAnimationFrame(processFrame);
}