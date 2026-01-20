let video, inCanvas, outCanvas, inCtx;
let ready = false;

function onOpenCvReady() {
  console.log("OpenCV loaded");
  startCamera();
}

async function startCamera() {
  video = document.getElementById("video");
  inCanvas = document.getElementById("input");
  outCanvas = document.getElementById("output");
  inCtx = inCanvas.getContext("2d");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  video.addEventListener("loadedmetadata", () => {
    inCanvas.width = outCanvas.width = video.videoWidth;
    inCanvas.height = outCanvas.height = video.videoHeight;
    ready = true;
    requestAnimationFrame(loop);
  });
}

function loop() {
  if (!ready || typeof cv === "undefined" || !cv.imread) {
    requestAnimationFrame(loop);
    return;
  }

  // video → input canvas
  inCtx.drawImage(video, 0, 0, inCanvas.width, inCanvas.height);

  // input canvas → OpenCV
  let src = cv.imread(inCanvas);

  // ★ 何もしないで output に出す
  cv.imshow(outCanvas, src);

  src.delete();
  requestAnimationFrame(loop);
}