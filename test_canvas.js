const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, 300, 300);

ctx.fillStyle = "white";
ctx.fillRect(50, 50, 200, 200);