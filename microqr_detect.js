const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function detectMicroQR() {
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;

  let black = 0;
  let white = 0;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i] === 0) black++;
    else white++;
  }

  const ratio = black / (black + white);

  // microQR が写っているときは黒率が急に上がる
  if (ratio > 0.35 && ratio < 0.65) {
    console.log("MicroQR? (" + ratio.toFixed(2) + ")");
  } else {
    console.log("not QR");
  }

  requestAnimationFrame(detectMicroQR);
}

detectMicroQR();