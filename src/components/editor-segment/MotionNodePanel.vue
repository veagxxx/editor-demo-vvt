<template>
  <div class="motion-node-dialog">
    <el-dialog 
      v-model="visible" 
      align-center 
      :width="600" 
      :modal="false" 
      :show-close="false" 
      :close-on-click-modal="false" 
      class="action-model"
      @open="afterOpen"
    >
      <div class="segment-node__panel">
        <el-row :gutter="12">
          <el-col :span="8" v-for="item in HMotionList" :key="item.code">
            <div 
              class="node-action-item" 
              :class="{ 'is-active': data.motion && data.motion.code === item.code }" 
              @click="pickMotion(item)"
            >
              {{ item.text }}-{{ item.duration }}s
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="node-action-footer">
          <el-button @click="close">取 消</el-button>
          <el-button type="primary" :disabled="!data.motion" @click="confirmMotion">确 认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { IHMotion } from './types';
import { HMotionList } from './constants';

interface IData
{
  motion: IHMotion | null;
  isReplace: boolean;
  replaceCallback?: Function;
}

interface IOpenParams
{
  motion?: IHMotion;
  callback?: Function;
}

const visible = ref<boolean>(false);

const emit = defineEmits<{
  (e: 'handlePickMotion', motion: IHMotion): void;
  (e: 'replaceSuccess'): void;
  (e: 'handleOpen'): void;
}>();

const data: IData = reactive({
  motion: null,
  isReplace: false,
});

function afterOpen()
{
  emit('handleOpen');
}

function open({ motion, callback }: IOpenParams)
{
  visible.value = true;
  if (motion) 
  {
    data.motion = motion;
    data.isReplace = true;
    // 回调事件（在动作修改时做替换用）
    if (callback)
    {
      data.replaceCallback = callback;
    }
  }
}

function close()
{
  visible.value = false;
  data.isReplace = false;
  data.motion = null;
}

function pickMotion(motion: IHMotion)
{
  data.motion = motion;
}

function confirmMotion()
{
  // 替换
  if (data.isReplace && data.replaceCallback)
  {
    data.replaceCallback(data.motion);
    close();
    return;
  }
  // 插入
  if (data.motion)
  {
    emit('handlePickMotion', data.motion);
    close();
  }
}

defineExpose({
  open
});
</script>

<style lang="scss" scoped>
  .motion-node-dialog {
    :deep(.el-dialog) {
      padding: 0px;
      .el-dialog__body {
        overflow: hidden;
        overflow-y: auto;
        padding: 0 12px;
      }
      .el-dialog__footer {
        border-top: 1px solid #eceff2;
        padding: 12px;
      }
    }
  }
  .segment-node__panel {
    height: 350px;
    .node-action-item {
      width: 100%;
      height: 80px;
      text-align: center;
      padding: 0 6px;
      margin-bottom: 16px;
      cursor: pointer;
      vertical-align: top;
      position: relative;
      border: 1px solid var(--el-color-primary-light-7);
      box-sizing: border-box;
      &.is-active {
        border-color: var(--el-color-primary);
      }
    }
  }
</style>
