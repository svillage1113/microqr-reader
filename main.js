function waitForOpenCV() {
  if (typeof cv === "undefined") {
    setTimeout(waitForOpenCV, 50);
    return;
  }

  cv['onRuntimeInitialized'] = () => {
    console.log("OpenCV fully initialized");
    startCamera();   // ← ここから処理開始
  };
}

waitForOpenCV();