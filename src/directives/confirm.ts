import { ElMessageBox } from 'element-plus';
import { DirectiveBinding } from 'vue';

type ConfirmElement = HTMLElement & {
  __confirm__: (ev: MouseEvent) => void;
}

function onButtonClick(el: ConfirmElement, callback: Function)
{
  console.log('click', el);
  ElMessageBox.confirm('确定消息', '提示', {
    appendTo: 'body',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    callback && callback();
  }).catch(() => {});
}

export const vConfirm = {
  mounted(el: ConfirmElement, binding: DirectiveBinding) {
    const value = binding.value;
    if (!value || typeof value !== 'function')
    {
      throw new Error(`v-confirm directive value must be a function.`);
    }
    el.__confirm__ = () => {
      onButtonClick(el, value);
    }
    el.addEventListener('click', el.__confirm__);
    console.log('el', el, binding);
  },
  unmounted(el: ConfirmElement) {
    el.removeEventListener('click', el.__confirm__);
  },
}