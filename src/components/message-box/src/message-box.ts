

import { AppContext, ComponentPublicInstance, createVNode, isVNode, render, VNode } from 'vue';
import MessageBoxComponent from './index.vue';
import { isElement, isFunction, isObject, isString, isUndefined } from 'lodash-es';
import { Action, Callback, IZMessageBox, MessageBoxData, ZMessageBoxOptions, ZMessageBoxShortcutMethod, ZMessageBoxChainsMethod } from './message-box.type';

const messageInstance = new Map<
  ComponentPublicInstance<{ doClose: () => void }>, // marking doClose as function
  {
    options: any
    callback: Callback | undefined
    resolve: (res: any) => void
    reject: (reason?: any) => void
  }
>()

const getAppendToElement = (props: any): HTMLElement => {
  let appendTo: HTMLElement | null = document.body;
  if (props.appendTo) {
    if (isString(props.appendTo)) {
      appendTo = document.querySelector<HTMLElement>(props.appendTo);
    }
    if (isElement(props.appendTo)) {
      appendTo = props.appendTo;
    }

    // should fallback to default value with a warning
    if (!isElement(appendTo)) {
      appendTo = document.body;
    }
  }
  return appendTo!;
}
const initInstance = (
  props: any,
  container: HTMLElement,
  appContext: AppContext | null = null
) => {
  const vnode = createVNode(
    MessageBoxComponent,
    props,
    isFunction(props.message) || isVNode(props.message)
      ? {
          default: isFunction(props.message)
            ? props.message
            : () => props.message,
        }
      : null
  );
  vnode.appContext = appContext;
  render(vnode, container);
  getAppendToElement(props).appendChild(container.firstElementChild!);
  return vnode.component;
}

const genContainer = () => {
  return document.createElement('div');
}

const showMessage = (options: any, appContext?: AppContext | null) => {
  const container = genContainer();
  options.onVanish = () => {
    // not sure if this causes mem leak, need proof to verify that.
    // maybe calling out like 1000 msg-box then close them all.
    render(null, container);
    messageInstance.delete(vm); // Remove vm to avoid mem leak.
    // here we were suppose to call document.body.removeChild(container.firstElementChild)
    // but render(null, container) did that job for us. so that we do not call that directly
  }

  options.onAction = (action: Action) => {
    const currentMsg = messageInstance.get(vm)!;
    let resolve: Action | { value: string; action: Action };
    if (options.showInput) {
      resolve = { value: '', action };
    } else {
      resolve = action;
    }
    if (options.callback) {
      options.callback(resolve, instance.proxy);
    } else {
      if (action === 'cancel' || action === 'close') {
        if (options.distinguishCancelAndClose && action !== 'cancel') {
          currentMsg.reject('close');
        } else {
          currentMsg.reject('cancel');
        }
      } else {
        currentMsg.resolve(resolve);
      }
    }
  }
  const instance = initInstance(options, container, appContext)!;
  const vm = instance.proxy as ComponentPublicInstance<
    {
      visible: boolean;
      doClose: () => void;
    }
  >;
  for (const prop in options) {
    if (options.hasOwnProperty(prop) && !vm.$props.hasOwnProperty(prop)) {
      vm[prop as keyof ComponentPublicInstance] = options[prop];
    }
  }
  vm.visible = true;
  return vm;

}
async function MessageBox(
  options: ZMessageBoxOptions,
  appContext?: AppContext | null
): Promise<MessageBoxData>
function MessageBox(
  options: ZMessageBoxOptions,
  appContext?: AppContext | null
): Promise<{ value: string; action: Action } | Action>
{
  let callback: Callback | undefined;
  if (isString(options) || isVNode(options)) {
    options = {
      message: options,
    }
  } else {
    callback = options.callback;
  }
  return new Promise((resolve, reject) => {
    const vm = showMessage(options, appContext ?? (MessageBox as IZMessageBox)._context);
    messageInstance.set(vm, {
      options,
      callback,
      resolve,
      reject
    });
  });
}

const MESSAGE_BOX_VARIANTS = ['alert', 'confirm', 'prompt'] as const;
const MESSAGE_BOX_DEFAULT_OPTS: Record<
  typeof MESSAGE_BOX_VARIANTS[number],
  Partial<ZMessageBoxOptions>
> = {
  alert: { closeOnPressEscape: false, closeOnClickModal: false },
  confirm: { showCancelButton: true },
  prompt: { showCancelButton: true },
}
MESSAGE_BOX_VARIANTS.forEach((boxType) => {
  ;(MessageBox as IZMessageBox)[boxType] = messageBoxFactory(boxType) as ZMessageBoxShortcutMethod;
});

function messageBoxFactory(boxType: typeof MESSAGE_BOX_VARIANTS[number]) {
  return (
    message: string | VNode,
    title: string | ZMessageBoxOptions,
    options?: ZMessageBoxOptions,
    appContext?: AppContext | null
  ) => {
    let titleOrOpts = '';
    if (isObject(title)) {
      options = title as ZMessageBoxOptions;
      titleOrOpts = '';
    } else if (isUndefined(title)) {
      titleOrOpts = '';
    } else {
      titleOrOpts = title as string;
    }

    return MessageBox(
      Object.assign(
        {
          title: titleOrOpts,
          message,
          type: '',
          ...MESSAGE_BOX_DEFAULT_OPTS[boxType],
        },
        options,
        {
          boxType,
        }
      ),
      appContext ?? null
    );
  }
} 

function messageChainsBoxFactory()
{
  const resolves: MessageBoxData[] = [];
  const machiningMessageBox = async (options: ZMessageBoxOptions[]) =>
  {
    if (options.length === 0) {
      const res = [...resolves];
      resolves.length = 0;
      // FIXME: resolve or reject
      return res;
    }
    let option = options.shift()!;
    let titleOrOpts = '';
    if (isObject(option.title)) {
      option = option.title as ZMessageBoxOptions;
      titleOrOpts = '';
    } else if (isUndefined(option.title)) {
      titleOrOpts = '';
    } else {
      titleOrOpts = option.title as string;
    }

    try {
      const res = await MessageBox(
        Object.assign(
          {
            title: titleOrOpts,
            message: option.message,
          },
          option,
          {
            boxType: 'chains',
          }
        ),
      );
      resolves.push(res);
      if (option.confirmButtonActionDone) {
        const res = [...resolves];
        resolves.length = 0;
        // FIXME: resolve or reject
        return res; 
      }
    } catch (error: any) {
      resolves.push(error);
      if (option.cancelButtonActionDone) {
        const res = [...resolves];
        resolves.length = 0;
        // FIXME: resolve or reject
        return res; 
      }
    }
    if (option.done) {
      const res = [...resolves];
      resolves.length = 0;
      // FIXME: resolve or reject
      return res; 
    }
    return machiningMessageBox(options);
  };
  return machiningMessageBox;
}
MessageBox.chains = messageChainsBoxFactory() as ZMessageBoxChainsMethod;

MessageBox.close = () => {

  messageInstance.forEach((_, vm) => {
    vm.doClose();
  })

  messageInstance.clear();
}
;(MessageBox as IZMessageBox)._context = null;


export default MessageBox as IZMessageBox;
