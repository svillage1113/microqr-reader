(async () => {
  try {
    const video = document.getElementById("video");
    if (!video) {
      console.error("video element not found");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true); // iOS必須
    await video.play();

  } catch (e) {
    console.error("camera error", e);
  }
})();