import { computed } from "vue";

export function useVModel<T, K extends keyof T>(props: T, propName: K, emit: (key: any, value: T[K]) => void)
{
  const model = computed({
    get() {
      // 确保 props[propName] 存在
      const value = props[propName];

      if (Array.isArray(value)) {
        // 如果是数组，返回一个 Proxy 对象以监听数组的变化
        const proxy = new Proxy(value, {
          get(target, key) {
            return Reflect.get(target, key);
          },
          set(target, key, newValue) {
            // 更新数组的属性值，并发送 update 事件
            target[key as any] = newValue;
            emit(`update:${propName as string}`, [...target] as T[K]);
            return true;
          }
        });
        return proxy as T[K];
      } else if (typeof value === 'object' && value !== null) {
        // 如果是对象，创建一个 Proxy 对象来监听对象属性的变化
        const proxy = new Proxy(value, {
          get(target, key) {
            return Reflect.get(target, key);
          },
          set(target, key, newValue) {
            // 更新对象的属性值，并发送 update 事件
            emit(`update:${propName as string}`, { ...target, [key]: newValue } as T[K]);
            return true;
          }
        });
        return proxy as T[K];
      }

      return value as T[K];
    },
    set(value: T[K]) {
      // 当值发生变化时发送 update 事件
      emit(`update:${propName as string}`, value);
    }
  });
  return model;
}