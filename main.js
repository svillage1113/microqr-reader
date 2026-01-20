let video, canvas, ctx;

function onOpenCvReady() {
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
    requestAnimationFrame(loop);
  });
}

function loop() {
  // video → canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // canvas → OpenCV
  let src = cv.imread(canvas);

  // ★ 処理しない（そのまま返す）
  cv.imshow(canvas, src);

  src.delete();
  requestAnimationFrame(loop);
}