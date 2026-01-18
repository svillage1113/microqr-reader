const video = document.getElementById("video");
const resultDiv = document.getElementById("result");

const codeReader = new ZXing.BrowserMultiFormatReader(
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

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = stream;

    codeReader.decodeFromVideoElement(video, (result, err) => {
      if (result) {
        resultDiv.textContent = result.getText();
      }
    });

  } catch (e) {
    resultDiv.textContent = "カメラ起動失敗";
    console.error(e);
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  startCamera();
});