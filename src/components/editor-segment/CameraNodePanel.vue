<template>
  <div class="camera-node-dialog">
    <el-dialog 
      v-model="visible" 
      align-center 
      :width="500" 
      :modal="false" 
      :show-close="false" 
      :close-on-click-modal="false" 
      @open="afterOpen"
    >
      <div class="segment-node__panel">
        <el-row :gutter="12">
          <el-col :span="8" v-for="item in CameraList" :key="item.code">
            <div 
              class="node-action-item" 
              :class="{ 'is-active': data.camera && data.camera.code === item.code }" 
              @click="pickCamera(item)"
            >
              {{ item.text }}-{{ item.duration }}s
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <div class="node-action-footer">
          <el-button @click="close">取 消</el-button>
          <el-button type="primary" :disabled="!data.camera" @click="confirmCamera">确 认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ICamera } from './types';
import { CameraList } from './constants';

interface IData
{
  camera: ICamera | null;
  isReplace: boolean;
  replaceCallback?: Function;
}

interface IOpenParams
{
  camera?: ICamera;
  callback?: Function;
}

const visible = ref<boolean>(false);

const emit = defineEmits<{
  (e: 'handlePickCamera', camera: ICamera): void;
  (e: 'replaceSuccess'): void;
  (e: 'handleOpen'): void;
}>();


const data: IData = reactive({
  camera: null,
  isReplace: false,
});

function open({ camera, callback }: IOpenParams)
{
  visible.value = true;
  if (camera) 
  {
    data.camera = camera;
    data.isReplace = true;
    if (callback)
    {
      data.replaceCallback = callback;
    }
  }
}

function afterOpen()
{
  emit('handleOpen');
}

function close()
{
  visible.value = false;
  data.isReplace = false;
  data.camera = null;
}

function pickCamera(camera: ICamera)
{
  data.camera = camera;
}

function confirmCamera()
{
  // 替换
  if (data.isReplace && data.replaceCallback)
  {
    data.replaceCallback(data.camera);
    close();
    return;
  }
  // 插入
  if (data.camera)
  {
    emit('handlePickCamera', data.camera);
    close();
  }
}

defineExpose({
  open
});
</script>

<style lang="scss" scoped>
  .camera-node-dialog {
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
    height: 300px;
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
