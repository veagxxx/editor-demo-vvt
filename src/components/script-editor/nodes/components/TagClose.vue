<template>
  <el-icon class="tag-close" :size="12">
    <svg-icon iconClass="close"></svg-icon>
  </el-icon>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.tag-close {
  cursor: pointer;
  color: #1a1a1a;
  margin-left: 2px;
  width: 22px;
  height: 16px;
  user-select: none;
  transition: transform 0.3s;
  &:hover {
    transform: rotate(90deg);
  }
}
</style>
