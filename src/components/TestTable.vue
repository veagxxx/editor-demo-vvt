<template>
  <el-table :data="modelData">
    <el-table-column>
      <template #default="{ row }">
        <el-radio v-model="selectedId" :value="row.id"></el-radio>
      </template>
    </el-table-column>
    <el-table-column label="名字" prop="name"></el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button link type="danger" @click="onDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-select
      v-model="selectedHumans"
      multiple
      value-key="id"
      placeholder="Multi Select"
      style="margin-left: 8px;width: 240px"
    >
      <el-option
        v-for="item in humanList"
        :key="item.id"
        :label="item.humanName"
        :value="item"
      />
    </el-select>
</template>

<script lang="ts" setup>
import { useVModel } from '@/hooks/use-vmodel';
import { PropType, ref } from 'vue';

const props = defineProps({
  tableData: {
    type: Array as PropType<any[]>,
    default: () => []
  }
});
const emit = defineEmits(['update:tableData']);
const modelData = useVModel(props, 'tableData', emit);
const selectedId = ref<number>();
const selectedHumans = ref([]);
const humanList = [
    { id: 1, humanName: '蔡小坤', humanCode: 'i123123Kun_code12312' },
    { id: 2, humanName: '坤小蔡', humanCode: 'iKun_code_2' }
  ]
function onDelete(row: any)
{
  // const index = modelData.value.findIndex(item => item.name == row.name);
  // if (index > -1) {
  //   console.log('index', index, Array.isArray(modelData.value));
  //   modelData.value.splice(index, 1);
  // }
  selectedId.value = undefined;
}
</script>

<style lang="scss" scoped>

</style>
