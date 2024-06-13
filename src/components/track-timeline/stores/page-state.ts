import { ref, watchEffect } from 'vue';
import { defineStore } from 'pinia';
import globalDefault from '../global-default';

export const usePageState = defineStore('pageState', () => {
  // 属性宽度
  const attrWidth = ref(parseInt(localStorage.attrW) || globalDefault.track.height);
  // 轨道高度
  const trackHeight = ref(parseInt(localStorage.trackH || globalDefault.track.height));
  watchEffect(() => {
    localStorage.attrW = attrWidth.value;
    localStorage.trackH = trackHeight.value;
  });

  return {
    attrWidth,
    trackHeight
  };
});
