<template>
  <svg :class="svgClass" aria-hidden="true" v-bind="attrs">
    <use :xlink:href="iconName" />
  </svg>
</template>
<script lang="ts" setup>
  import { computed, reactive, useAttrs } from 'vue';
  const props = defineProps({
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'default'
    }
  });
  const attrs = useAttrs();
  const svgClass = computed(() => {
    return {
      'svg-icon': true,
      [props.className]: props.className,
      [`svg-icon-${props.size}`]: props.size,
    }
  });
  const iconName = computed(() => {
    return `#icon-${props.iconClass}`
  });
  const fontSize = reactive({ default: '1em', small: '0.75em', large: '1.5em' });
</script>
<style lang='scss' scoped>
  .svg-icon {
    width: v-bind('fontSize.default');
    height: v-bind('fontSize.default');
    vertical-align: -.15em;
    fill: currentColor;
    font-size: v-bind('fontSize.default');
    overflow: hidden;
    &.svg-icon-large {
      font-size: v-bind('fontSize.large');
      height: v-bind('fontSize.large');
    }
    &.svg-icon-small {
      font-size: v-bind('fontSize.small');
      height: v-bind('fontSize.small');
    }
  }
</style> 