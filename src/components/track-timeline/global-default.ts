export default {
  timeline: {
    ratio: window.devicePixelRatio || 1, // 设备像素比
    // bgLightColor: '#E5E7EB',
    bgColor: '#374151', // 背景颜色
    textSize: 12, // 字号
    textScale: 0.83, // 支持更小号字： 10 / 12
    lineWidth: 1, // 线宽
    textBaseline: 'middle' as 'middle', // 文字对齐基线
    textAlign: 'center' as 'center', // 文字对齐方式
    // longLightColor:'#374151', // 长线段颜色
    longColor: '#E5E7EB', // 长线段颜色
    // shortLightColor: '#6B7280', // 短线段颜色
    shortColor: '#9CA3AF', // 短线段颜色
    // textLightColor: '#374151', // 文字颜色
    textColor: '#E5E7EB', // 文字颜色
    // subTextLightColor: '#6B7280', // 小文字颜色
    subTextColor: '#9CA3AF', // 小文字颜色
    // focusLightColor: '#C4B5FD', // 选中元素区间
    focusColor: '#6D28D9', // 选中元素区间
  },
  track: {
    height: 250, // 高度
    scale: 60, // 缩放
    fps: 30,
    trackclip: {}
  }
};
