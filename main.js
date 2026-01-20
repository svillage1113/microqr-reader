const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  video.addEventListener("loadedmetadata", () => {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    function draw() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(draw);
    }

    draw();
  });
})();