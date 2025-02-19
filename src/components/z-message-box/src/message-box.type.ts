import { ButtonType, ComponentSize } from 'element-plus';
import { Component } from 'vue';

export type ButtonEvent = (action: Action, next?: () => void, done?: () => void) => void;
export type MessageBoxType = 'show' | 'confirm' | 'chains';
export type Action = 'confirm' | 'cancel' | 'close' | string;
export type Callback =
  | ((value: string, action: Action) => any)
  | ((action: Action) => any)

export interface IMessageBoxButton
{
  text?: string;
  showButtonText?: boolean;
  type?: ButtonType;
  size?: ComponentSize;
  icon?: Component | string;
  loading?: boolean;
  loadingIcon?: Component | string;
  disabled?: boolean;
  action?: Action;
  onClick?: ButtonEvent;
}

export interface IMessageBoxOptions
{
  title?: string;
  message?: string;
  buttonSize?: ComponentSize;
  showClose?: boolean;
  roundButton?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  draggable?: boolean;
  center?: boolean;
  destroyOnClose?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  cancelButtonClass?: string;
  confirmButtonClasses?: string;
  cancelButtonLoading?: boolean;
  confirmButtonLoading?: boolean;
  cancelButtonLoadingIcon?: Component | string;
  confirmButtonLoadingIcon?: Component | string;
  confirmButtonDisabled?: boolean;
  dangerouslyUseHTMLString?: boolean;
  distinguishCancelAndClose?: boolean
  appendTo?: HTMLElement | string;
  boxType?: MessageBoxType
  buttons?: IMessageBoxButton[];
}
export interface IZeeMessageBoxState
{
  title: string;
  message: string;
  action: Action;
  beforeClose:
    | null
    | ((action: Action, instance: IZeeMessageBoxState, done: () => void) => void);
  destroyOnClose: boolean;
  showCancelButton: boolean;
  showConfirmButton: boolean;
  cancelButtonText: string;
  confirmButtonText: string;
  cancelButtonClass: string;
  confirmButtonClasses: string;
  cancelButtonLoading: boolean;
  confirmButtonLoading: boolean;
  cancelButtonLoadingIcon: Component | string;
  confirmButtonLoadingIcon: Component | string;
  confirmButtonDisabled: boolean;
  dangerouslyUseHTMLString: boolean;
  distinguishCancelAndClose: boolean
}
