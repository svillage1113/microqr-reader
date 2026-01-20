const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ★ CSSではなく「属性」でサイズ指定（重要）
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 赤で塗る
ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);