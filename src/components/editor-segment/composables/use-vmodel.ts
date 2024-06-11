import { computed, defineEmits } from "vue";

export function useVModel<T extends Object, K extends keyof T>(props: T, propsName: K)
{
  const emit = defineEmits([`update:${propsName as string}`]);
  const model = computed({
    get() {
      return props[propsName];
    },
    set(value) {
      emit(`update:${propsName as string}`, value);
    }
  });
  return model;
}