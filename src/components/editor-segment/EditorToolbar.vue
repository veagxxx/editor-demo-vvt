<template>
  <div class="editor-segment__toolbar">
    <PauseTooltip @afterShow="disableButton" @pickPauseTime="onInserPauseNode">
      <el-button ref="pauseRef" :icon="VideoPause" :disabled="isButtonDisabled">
        停顿
      </el-button>
    </PauseTooltip>
    <el-button ref="motionRef" :disabled="isButtonDisabled" @click="openMotionPanel()">
      动作
    </el-button>
    <el-button 
      ref="cameraRef" 
      :icon="Camera" 
      @click="openCameraPanel()" 
      :disabled="isButtonDisabled"
    >
      镜头
    </el-button>
    <el-button @click="onProduce">一键生成</el-button>
    <MotionNodePanel 
      ref="motionNodeRef" 
      @handlePickMotion="insertMotionNode"
      @handleOpen="disableButton"
    ></MotionNodePanel>
    <CameraNodePanel
      ref="cameraNodeRef"
      @handlePickCamera="insertCameraNode"
      @handleOpen="disableButton"
    ></CameraNodePanel>
  </div>
</template>

<script lang="ts" setup>
import PauseTooltip from './PauseTooltip.vue';
import type { Editor } from '@tiptap/vue-3';
import { VideoPause, Camera } from '@element-plus/icons-vue';
import { reactive, computed, ref, watch, onBeforeUnmount } from 'vue';
import { NodeName } from './editor.enum';
import MotionNodePanel from './MotionNodePanel.vue';
import CameraNodePanel from './CameraNodePanel.vue';
import { ICamera, IHMotion, SegmentNodeType, Output, SegmentType } from './types';

interface IProps
{
  editor?: Editor;
  output: Output;
}

interface IData
{
  isFocus: boolean;
}

const props = withDefaults(defineProps<IProps>(), {});

const pauseRef = ref();
const motionRef = ref();
const cameraRef = ref();
const motionNodeRef = ref<InstanceType<typeof MotionNodePanel>>();
const cameraNodeRef = ref<InstanceType<typeof CameraNodePanel>>();

const data: IData = reactive({
  isFocus: false,
});

// 停顿按钮禁用
const isButtonDisabled = computed(() => {
  return !(data.isFocus || props.editor?.isFocused);
});

onBeforeUnmount(unmountEditorEvent);

watch(() => props.editor, () => {
  unmountEditorEvent();
  mountEditorEvent();
});

function unmountEditorEvent()
{
  props.editor?.off('focus');
  props.editor?.off('blur');
  props.editor?.off('selectionUpdate');
}

function mountEditorEvent()
{
  props.editor?.on('focus', () => {
    data.isFocus = true;
  });
  props.editor?.on('blur', ({ event }) => {
    const actionButtons = [
      pauseRef.value?.$el, 
      cameraRef.value?.$el, 
      motionRef.value?.$el
    ].filter(Boolean);
    // 判断触发失焦的是否为按钮
    if (!actionButtons.includes(event.relatedTarget))
    {
      disableButton();
    }
  });
  props.editor?.on('selectionUpdate', ({ editor }) => {
    data.isFocus = editor.state.selection.empty;
  });
}

function disableButton()
{
  data.isFocus = false;
}

// 插入停顿时间节点
function onInserPauseNode(value: number)
{
  props.editor?.commands.insertContent({ type: NodeName.Pause, attrs: { time: value } });
}
// 打开动作面板
function openMotionPanel(motion?: IHMotion, callback?: Function)
{
  motionNodeRef.value?.open({
    motion,
    callback
  });
}
// 插入动作节点
function insertMotionNode(motion: IHMotion)
{
  // 构建要插入的 MotionNode 节点数据
  const motionNode = {
    type: NodeName.Motion,
    attrs: {
      code: motion.code,
      duration: motion.duration,
      text: motion.text,
    },
  };
  props.editor?.commands.insertContent(motionNode);
  disableButton();
}

function openCameraPanel(camera?: ICamera, callback?: Function)
{
  cameraNodeRef.value?.open({
    camera,
    callback
  });
}

function insertCameraNode(camera: ICamera)
{
  // 构建要插入的 CameraNode 节点数据
  const cameraNode = {
    type: NodeName.Camera,
    attrs: {
      duration: camera.duration,
      code: camera.code,
      text: camera.text,
    },
  };
  props.editor?.commands.insertContent(cameraNode);
  disableButton();
}

function onProduce()
{
  if (props.output === 'xml')
  {
    console.log('xml:', props.editor?.getHTML());
  }
  else
  {
    console.log('text:', props.editor?.getText());
  }
}

// 弹框面板open函数与节点名称的映射
const panelMapping = {
  [NodeName.Motion]: openMotionPanel,
  [NodeName.Camera]: openCameraPanel,
};

function openSegmentPanel(node: SegmentNodeType, segment?: SegmentType, callback?: Function)
{
  if (panelMapping[node])
  {
    panelMapping[node](segment, callback);
  }
}

defineExpose({
  openSegmentPanel
});

</script>
