setTimeout(() => {
  const el = document.getElementById("test");
  if (el) {
    el.innerText = "external JS loaded";
    el.style.color = "green";
  }
}, 100);