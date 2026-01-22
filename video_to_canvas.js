const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  await video.play();

  canvas.width = video.videoWidth || 300;
  canvas.height = video.videoHeight || 300;

  requestAnimationFrame(draw);
}

function draw() {
  if (video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(draw);
}

startCamera();