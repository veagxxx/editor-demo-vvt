<script setup lang="ts">
// import EditorSegment from './components/editor-segment/index.vue';
import VideoClip from './components/video-clip/index.vue';
import { ref } from 'vue';
import ScriptEditor from '@/components/script-editor/ScriptEditor.vue';
import { styled } from './components/styled-components';
let color = 'red';
const Wrapper = styled.div`
  background-color: ${color};
  width: 200px;
  height: 200px;
  &:hover {
    color: 'green';
  }
`;

console.log('[Wrapper]', Wrapper);

const content = ref('<speak><camera id="cam-2025720155276224612755" name="全景-下降-推近" code="SCENE_CAMERA_000304" type="general" duration="9"><hmotion id="hm-202572215930391711135" name="T台走秀2" code="DH_ACTION_MODEL103_000031" type="whole_body" duration="7.4"></hmotion>也许放弃，<break id="bk-20257271636413592334869" time="2s"></break>才能靠近你<break id="bk-20257271636413128167" time="5s"></break>，<hmotion id="hm-20257271636413943165108" name="深度解说" code="DH_ACTION_MODEL103_000027" type="upper_body" duration="10.333"></hmotion>不再见你</camera>，你才会把我记起，时间累积，这盛夏的果实<hmotion id="hm-20257271636413766346491" name="正式介绍" code="DH_ACTION_MODEL103_000026" type="upper_body" duration="7.667"></hmotion>，回忆里寂寞的香气，<camera id="cam-202572015527621496947" name="全景-右侧-环绕" code="SCENE_CAMERA_000302" type="general" duration="10">我要试着离开你，不要再想你，虽然这并不<hmotion id="hm-202572015527694118382" name="感谢" code="DH_ACTION_MODEL103_000001" type="upper_body" duration="2.767"></hmotion>是我本意</camera></speak>');
</script>

<template>
  <ScriptEditor v-model="content" editable></ScriptEditor>
  <br>
  <VideoClip></VideoClip>
  <Wrapper class="styled-div">
    <div class="children">123</div>
  </Wrapper>
</template>

<style scoped>
  .btn-wrapper {
    position: absolute;
    top: 50px;
    left: 50px;
  }
</style>
