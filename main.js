const video = document.getElementById("video");
const result = document.getElementById("result");
const startBtn = document.getElementById("start");

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

startBtn.addEventListener("click", async () => {
  try {
    // ① カメラ取得
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    // ② 映像表示
    video.srcObject = stream;
    await video.play();

    // ③ 表示が安定してから ZXing 起動
    setTimeout(() => {
      reader.decodeFromVideoElement(video, (res, err) => {
        if (res) {
          result.textContent = res.getText();
        }
      });
    }, 300);

  } catch (e) {
    alert(e.message);
  }
});