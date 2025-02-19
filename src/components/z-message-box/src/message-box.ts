import { isElement, isFunction, isObject, isString, isUndefined } from 'lodash-es';
import { ComponentPublicInstance, createVNode, isVNode, render, VNode } from 'vue';
import MessageBoxInstance from './index.vue';
import { Action, IMessageBoxOptions, MessageBoxType } from './message-box.type';

const messageInstance = new Map<
  ComponentPublicInstance<{ doClose: () => void }>, // marking doClose as function
  {
    options: IMessageBoxOptions;
    resolve: (res: any) => void;
    reject: (reason?: any) => void;
  }
>();

const getAppendToElement = (props: any): HTMLElement =>
{
  let appendTo: HTMLElement | null = document.body;
  if (props.appendTo)
  {
    if (isString(props.appendTo))
    {
      appendTo = document.querySelector<HTMLElement>(props.appendTo);
    }
    if (isElement(props.appendTo))
    {
      appendTo = props.appendTo;
    }

    if (!isElement(appendTo))
    {
      appendTo = document.body;
    }
  }
  return appendTo!;
};

function initInstance(props: any, container: HTMLElement)
{
  const vnode = createVNode(
    MessageBoxInstance, 
    props, 
    isFunction(props.message) || isVNode(props.message)
      ? {
          default: isFunction(props.message)
            ? props.message
            : () => props.message,
        }
      : null
  );
  render(vnode, container);
  getAppendToElement(props).appendChild(container.firstElementChild!);
  return vnode.component;
}

function genContainer()
{
  return document.createElement('div');
}

function showMessageBox(options: IMessageBoxOptions & { onVanish?: () => void; onAction?: (action: Action) => void })
{
  const container = genContainer();
  options.onVanish = () =>
  {
    render(null, container);
    messageInstance.delete(vm);
  };

  options.onAction = (action: Action) =>
  {
    const currentMsg = messageInstance.get(vm)!;
    let resolve: string = action;
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

  const instance = initInstance(options, container)!;
  const vm = instance.proxy as ComponentPublicInstance<
    {
      visible: boolean;
      doClose: () => void;
    }
  >;
  for (const prop in options)
  {
    if (prop in options && !(prop in vm.$props))
    {
      vm[prop as keyof ComponentPublicInstance] = options[prop as keyof IMessageBoxOptions];
    }
  }
  vm.visible = true;
  return vm;
}

function messageBoxFactory(boxType: MessageBoxType)
{
  return (
    message: string | VNode,
    title: string | IMessageBoxOptions,
    options?: IMessageBoxOptions,
  ) => {
    let titleOrOpts = '';
    if (isObject(title)) {
      options = title as IMessageBoxOptions;
      titleOrOpts = '';
    } else if (isUndefined(title)) {
      titleOrOpts = '';
    } else {
      titleOrOpts = title as string;
    }
    return ZeeMessageBox(
      Object.assign(
        {
          title: titleOrOpts,
          message,
          type: '',
        },
        options,
        {
          boxType,
        }
      )
    );
  }
}

export function ZeeMessageBox(options: IMessageBoxOptions)
{
  return new Promise((resolve, reject) => {
    const vm = showMessageBox(options);
    messageInstance.set(vm, { options, resolve, reject });
  });
}

ZeeMessageBox.show = messageBoxFactory('show');

ZeeMessageBox.chains = function (options: IMessageBoxOptions[])
{
  console.log('chains', options);
}
