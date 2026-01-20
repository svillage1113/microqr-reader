const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;

  // ★ metadata が来るのを待つ（超重要）
  video.addEventListener("loadedmetadata", () => {
    video.play();

    // ★ ここで初めてサイズ確定
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    function draw() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(draw);
    }

    draw();
  });
})();