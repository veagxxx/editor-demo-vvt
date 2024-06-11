<template>
  <el-popover
    placement="bottom-start"
    trigger="click"
    :width="480"
    :hide-after="0"
    :show-arrow="false"
    ref="popoverRef"
    @after-enter="onAfterShow"
    @after-leave="updateActive(false)"
  >
    <template #reference>
      <slot></slot>
    </template>
    <div class="popover-halton">
      <div 
        class="halton-value" 
        v-for="item in defaultTimes" 
        :key="'time-' + item"
        :class="{ 'halton-active': isActive(item) }"
        @click="onPauseTimeChange(item)"
      >
       {{ item }}s
      </div>
      <el-input 
        :class="{ 'halton-active__input': isActiveCustom }"
        v-model="data.customDuration" 
        type="number" 
        :step="0.1" 
        @focus="updateActive(true)"
      >
        <template #append>
          <div v-if="isRemovable" class="halton-pick__button" @click="onPickCustomDuration">选择</div>
          <div v-else class="halton-custom__button" @click="updateActive(true)">自定义</div>
        </template>
      </el-input>
      <el-divider direction="vertical"></el-divider>
      <el-button 
        v-if="isRemovable" 
        class="halton-confirm__button" 
        type="danger" 
        plain 
        @click="onRemoveNode">移除</el-button
      >
      <el-button 
        v-else 
        class="halton-confirm__button" 
        type="primary" 
        @click="onPauseTimeConfirm">确定</el-button
      >
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { computed, PropType, reactive, ref, watchEffect } from 'vue';

interface IData
{
  duration: number;
  customDuration: number;
  activeCustom: boolean;
}

const defaultTimes = ['0.5', '1.0', '2.0'];
const props = defineProps({
  time: {
    type: Number as PropType<number>
  }
});

const emit = defineEmits<{
  (e: 'pickPauseTime', time: number): void;
  (e: 'afterShow'): void;
  (e: 'removeTime'): void;
}>();

const popoverRef = ref();

const data: IData = reactive({
  duration: 1,
  customDuration: 9.9,
  activeCustom: false
});

// 可移除
const isRemovable = computed(() => !!props.time);

// 自定义停顿时间选中，回显时间 === 自定义时间 && 回显时间不属于默认时间，或者点击选中自定义时间
const isActiveCustom = computed(() => {
  return (
    props.time === data.duration && 
    !defaultTimes.map(Number).includes(props.time)
  ) || data.activeCustom;
});

watchEffect(() => {
  if (props.time) {
    data.duration = props.time;
  }
});

// 选中高亮
function isActive(time: string) 
{
  return (props.time === +time || data.duration === +time) && !isActiveCustom.value;
}

function onPauseTimeChange(time: string)
{
  // 回显修改时
  if (props.time) {
    onEmitClose(+time);
  }
  // 新增
  else {
    data.duration = +time;
    data.activeCustom = false;
  }
}

// 选择后需要关闭，并触发
function onEmitClose(time: number)
{
  emit('pickPauseTime', time);
  popoverRef.value?.hide();
}

function onAfterShow()
{
  // 非回显修改，做初始化
  if (!props.time) {
    data.duration = 1;
  }
  emit('afterShow');
}

function updateActive(actived: boolean)
{
  data.activeCustom = actived;
}

function onPickCustomDuration()
{
  if (!data.customDuration) {
    ElMessage.warning('请选择或输入数字');
    return;
  }
  data.customDuration = Math.max(+data.customDuration, 0.5);
  onEmitClose(data.customDuration);
}

function onPauseTimeConfirm()
{
  if (isActiveCustom.value) {
    onPickCustomDuration();
    return;
  }
  onEmitClose(data.duration);
}

function onRemoveNode()
{
  emit('removeTime');
}
</script>

<style lang="scss" scoped>
  .popover-halton {
    display: flex;
    align-items: center;
    text-align: center;
    width: 100%;
    .halton-value {
      border-radius: 6px;
      height: 30px;
      margin-right: 12px;
      line-height: 30px;
      width: 60px;
      background-color: #eceff2;
      color:  var(--el-color-primary);
      cursor: pointer;
      &:hover {
        background-color:  var(--el-color-primary-light-7);
      }
      &.halton-active {
        background-color:  var(--el-color-primary);
        color: #fff;
      }
    }
    :deep(.el-input) {
      width: 134px;
      height: 30px;
      margin-right: 12px;
      &.halton-active__input {
        .el-input__wrapper {
          box-shadow: 0 0 0 1px var(--el-color-primary, var(--el-border-color)) inset;
        }
        .el-input-group__append {
          box-shadow: none;
          border: 1px solid var(--el-color-primary);
          color: #fff;
          background-color: var(--el-color-primary);
        }
      }
    }
    :deep(.el-input-group__append) {
      padding: 0 10px;
      box-sizing: border-box;
      .halton-custom__button, .halton-pick__button {
        height: 30px;
        cursor: pointer;
        width: 100%;
        line-height: 30px;
      }
    }
    .halton-confirm__button {
      width: 60px;
      height: 30px;
      margin-left: 12px;
      cursor: pointer;
    }
  }
</style>