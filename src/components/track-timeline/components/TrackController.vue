<template>
  <div class="track-controller" >
    <div class="icon-wrapper">
      <div v-for="icon in icons" :key="icon.title" @click="onIconClick(icon)">
        <el-tooltip
          effect="dark"
          :content="icon.title"
          placement="top"
        >
          <el-icon :class="{ 'disabled-icon': icon.disabled }">
            <svg-icon :icon-class="icon.icon" />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    <span>{{ playTime }} / {{ allTime }}</span>
    <div class="slider-wrapper">
      <el-icon style="margin-right: 16px;" @click="changeScale(-10)">
        <svg-icon icon-class="substract" />
      </el-icon>
      <el-slider v-model="modelValue" v-bind="sliderProps" />
      <el-icon style="margin-left: 16px;" @click="changeScale(10)">
        <svg-icon icon-class="plus" />
      </el-icon>
    </div>
</div>
</template>

<script lang="ts" setup>
import { computed, PropType, reactive } from 'vue';
import { useTrackState } from '../stores/track-state';
import { formatPlayerTime } from '../utils/common';
import { usePlayerState } from '../stores/player-state';
// import { usePageState } from '../stores/page-state';
interface IconItem {
  title: string;
  disabled: boolean;
  icon: string;
}
const props = defineProps({
  modelValue: {
    type: Number as PropType<number>,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);
const playerStore = usePlayerState();
// const pageStore = usePageState();
const trackStore = useTrackState();

const sliderProps = reactive({
  showTooltip: false,
  size: 'small' as const,
  step: 10,
  max: 100,
  min: 0
});
// const statePoint = computed(() => pageStore._stepInfo.statePoint);
// const stateLength = computed(() => pageStore._stepInfo.stateLength);
const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});
const icons = computed<IconItem[]>(() => [
  {
    title: '撤销',
    // disable: stateLength.value === 0 || statePoint.value === 0,
    disabled: true,
    icon: 'undo'
  },
  {
    title: '前进',
    // disable: statePoint.value === stateLength.value,
    disabled: true,
    icon: 'redo'
  },
  {
    title: '分割',
    disabled: trackStore.selectTrackItem.line === -1 && trackStore.selectTrackItem.index === -1,
    icon: 'split'
  },
  {
    title: '删除',
    disabled: trackStore.selectTrackItem.line === -1 && trackStore.selectTrackItem.index === -1,
    icon: 'delete',
  }
]);

const playTime = computed(() => {
    return formatPlayerTime(playerStore.playStartFrame);
  });
  const allTime = computed(() => {
    return formatPlayerTime(playerStore.frameCount);
  });

function onIconClick(item: IconItem)
{
  const { icon, disabled } = item;
  if (disabled) {
    return;
  }
  if (icon === 'delete') {
    if (trackStore.selectTrackItem.line !== -1 && trackStore.selectTrackItem.index !== -1) {
      trackStore.removeTrack(trackStore.selectTrackItem.line, trackStore.selectTrackItem.index);
      trackStore.selectTrackItem.line = -1;
      trackStore.selectTrackItem.index = -1;
    }
  } else if (icon === 'undo') {
    // pageStore.undo()
  } else if (icon === 'redo') {
    // pageStore.redo()
  } else if (icon === 'split') {

  }
}

function changeScale(value: number)
{
  let newVal = modelValue.value + value;
  if (newVal > sliderProps.max)
  {
    newVal = sliderProps.max;
  }
  if (newVal < sliderProps.min)
  {
    newVal = sliderProps.min;
  }
  modelValue.value = newVal;
}
</script>

<style lang="scss" scoped>
  .track-controller {
    padding-left: 16px;
    padding-bottom: 4px;
    padding-right: 40px;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid;
    border-color: rgb(75 85 99);
    display: flex;
    justify-content: space-between;
    color: #b4b4b4;
    .icon-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      height: 36px;
      line-height: 1;
    }
    .slider-wrapper {
      width: 208px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .el-icon {
      cursor: pointer;
      &.disabled-icon {
        cursor: not-allowed;
        color: #4b4b4b;
      }
    }
  }
</style>
