<template>
  <div>
    home
    <el-button @click="onClick">点击</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';


const router = useRouter();
function onClick()
{
  router.push({ path: '/detail/dataset' })
}
</script>

<style lang="scss" scoped>

</style>
