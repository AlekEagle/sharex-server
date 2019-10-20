var canvas    = document.getElementById('bgCanvas'),
    ctx       = canvas.getContext('2d'),
	  perlin    = new ClassicalNoise(),
    variation = .003,
    amp       = 200,
    variators = [],
    max_lines = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) ? 25 : 30,
    canvasWidth,
    canvasHeight,
    start_y;

for (var i = 0, u = 0; i < max_lines; i++, u+=.02) {
  variators[i] = u;
}

function draw(){
  ctx.shadowColor = "rgba(43, 205, 255, 1)";
  ctx.shadowBlur = 0;
  
  for (var i = 0; i <= max_lines; i++){
    ctx.beginPath();
    ctx.moveTo(0, start_y);
    for (var x = 0; x <= canvasWidth; x++) {
      var y = perlin.noise(x*variation+variators[i], x*variation, 0);
      ctx.lineTo(x, start_y + amp*y);
    }
    var color = Math.floor(150*Math.abs(y));
    var alpha = Math.min(Math.abs(y), .8)+.1;
    ctx.strokeStyle = `rgba(80, 210, 240, ${alpha})`;
    ctx.stroke();
    ctx.closePath();

    variators[i] += .005;
  }
}

(function init() {
	resizeCanvas();
	animate();
	window.addEventListener('resize', resizeCanvas);
})();

function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  draw();
  requestAnimationFrame(animate);
}

function resizeCanvas(){
	canvasWidth = document.documentElement.clientWidth,
	canvasHeight = document.documentElement.clientHeight; 

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

	start_y = canvasHeight/2;
}