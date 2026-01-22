const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  await video.play();

  canvas.width = video.videoWidth || 300;
  canvas.height = video.videoHeight || 300;

  requestAnimationFrame(loop);
}

function loop() {
  if (video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;

    for (let i = 0; i < d.length; i += 4) {
      const gray = (d[i] + d[i+1] + d[i+2]) / 3;
      const v = gray > 128 ? 255 : 0;
      d[i] = d[i+1] = d[i+2] = v;
    }

    ctx.putImageData(img, 0, 0);
  }

  requestAnimationFrame(loop);
}

start();