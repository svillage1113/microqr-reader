const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const result = document.getElementById("result");
const btn = document.getElementById("start");
const ctx = canvas.getContext("2d");

const reader = new ZXing.BrowserMultiFormatReader(
  new Map([
    [
      ZXing.DecodeHintType.POSSIBLE_FORMATS,
      [
        ZXing.BarcodeFormat.QR_CODE,
        ZXing.BarcodeFormat.MICRO_QR_CODE
      ]
    ]
  ])
);

btn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  await video.play();

  // フレームを定期的に canvas にコピーして解析
  setInterval(async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      const res = await reader.decodeFromCanvas(canvas);
      if (res) result.textContent = res.getText();
    } catch (e) {
      // 未検出は無視
    }
  }, 300);
});