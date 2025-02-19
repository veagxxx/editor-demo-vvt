self.onmessage = function(event) {
  const { offscreen } = event.data;

  // 获取 2D 上下文
  const ctx = offscreen.getContext('2d');

  // 定义动画逻辑
  let angle = 0;

  function draw() {
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);

    // 绘制旋转的矩形
    ctx.save();
    ctx.translate(offscreen.width / 2, offscreen.height / 2);
    ctx.rotate(angle);
    ctx.fillStyle = 'blue';
    ctx.fillRect(-50, -50, 100, 100);
    ctx.restore();

    angle += 0.02;
    if (angle > Math.PI * 2) angle -= Math.PI * 2;

    // 请求下一帧
    requestAnimationFrame(draw);
  }

  // 开始动画
  draw();
};