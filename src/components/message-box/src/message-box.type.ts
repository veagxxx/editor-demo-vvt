import { ComponentSize, ButtonType } from "element-plus"
import { AppContext, Component, CSSProperties, VNode } from "vue"

type MessageType = '' | 'success' | 'warning' | 'info' | 'error';
export type Action = 'confirm' | 'close' | 'cancel';
export type MessageBoxType = '' | 'prompt' | 'alert' | 'confirm';
export type MessageBoxData = MessageBoxInputData & Action
export interface MessageBoxInputData {
  value: string
  action: Action
}

export interface ZMessageBoxFooter
{
  buttonText: string;
  buttonIcon?: string | Component;
  disabled?: boolean;
  buttonType?: ButtonType;
  onClick?: (e: Event, done: () => void) => void;
  customClass?: string;
  buttonSize?: ComponentSize;
  action?: Action;
  loading?: boolean;
  round?: boolean;
}

export interface ZMessageBoxOptions
{
  footers?: ZMessageBoxFooter[];
  autofocus?: boolean

  /** Callback before MessageBox closes, and it will prevent MessageBox from closing */
  beforeClose?: (
    action: Action,
    instance: MessageBoxState,
    done: () => void
  ) => void

  /** Custom class name for MessageBox */
  customClass?: string

  /** Custom inline style for MessageBox */
  customStyle?: CSSProperties

  /** MessageBox closing callback if you don't prefer Promise */
  callback?: Callback

  /** Text content of cancel button */
  cancelButtonText?: string

  /** Text content of confirm button */
  confirmButtonText?: string

  /** Loading Icon content of cancel button */
  cancelButtonLoadingIcon?: string | Component

  /** Loading Icon content of confirm button */
  confirmButtonLoadingIcon?: string | Component

  /** Custom class name of cancel button */
  cancelButtonClass?: string

  /** Custom class name of confirm button */
  confirmButtonClass?: string

  /** Whether to align the content in center */
  center?: boolean

  /** Whether MessageBox can be drag */
  draggable?: boolean

  /** Draggable MessageBox can overflow the viewport */
  overflow?: boolean

  /** Content of the MessageBox */
  message?: string | VNode | (() => VNode)

  /** Title of the MessageBox */
  title?: string | ZMessageBoxOptions

  /** Message type, used for icon display */
  type?: MessageType

  /** Message box type */
  boxType?: MessageBoxType

  /** Custom icon component */
  icon?: string | Component

  /** Whether message is treated as HTML string */
  dangerouslyUseHTMLString?: boolean

  /** Whether to distinguish canceling and closing */
  distinguishCancelAndClose?: boolean

  /** Whether to lock body scroll when MessageBox prompts */
  lockScroll?: boolean

  /** Whether to show a cancel button */
  showCancelButton?: boolean

  /** Whether to show a confirm button */
  showConfirmButton?: boolean

  /** Whether to show a close button */
  showClose?: boolean

  /** Whether to use round button */
  roundButton?: boolean

  /** Whether MessageBox can be closed by clicking the mask */
  closeOnClickModal?: boolean

  /** Whether MessageBox can be closed by pressing the ESC */
  closeOnPressEscape?: boolean

  /** Whether to close MessageBox when hash changes */
  closeOnHashChange?: boolean

  /** Custom size of confirm and cancel buttons */
  buttonSize?: ComponentSize

  /** Custom element to append the message box to */
  appendTo?: HTMLElement | string
}

export declare interface MessageBoxState
{
  footers: ZMessageBoxFooter[];
  autofocus: boolean
  title: string
  message: string
  type: MessageType
  icon: string | Component
  customClass: string
  customStyle: CSSProperties
  showConfirmButton: boolean
  showCancelButton: boolean
  action: Action
  dangerouslyUseHTMLString: boolean
  confirmButtonText: string
  cancelButtonText: string
  confirmButtonLoading: boolean
  cancelButtonLoading: boolean
  confirmButtonLoadingIcon: string | Component
  cancelButtonLoadingIcon: string | Component
  confirmButtonClass: string
  confirmButtonDisabled: boolean
  cancelButtonClass: string
  editorErrorMessage: string

  beforeClose:
    | null
    | ((action: Action, instance: MessageBoxState, done: () => void) => void)
  callback: null | Callback
  distinguishCancelAndClose: boolean
  modalFade: boolean
  modalClass: string
  // refer to: https://github.com/ElemeFE/element/commit/2999279ae34ef10c373ca795c87b020ed6753eed
  // seemed ok for now without this state.
  // isOnComposition: false, // temporary remove
  validateError: boolean
  zIndex: number
}

export type Callback =
  | ((value: string, action: Action) => any)
  | ((action: Action) => any)

export type ZMessageBoxShortcutMethod = ((
  message: ZMessageBoxOptions['message'],
  options?: ZMessageBoxOptions,
  appContext?: AppContext | null
) => Promise<MessageBoxData>) &
  ((
    message: ZMessageBoxOptions['message'],
    title: ZMessageBoxOptions['title'],
    options?: ZMessageBoxOptions,
    appContext?: AppContext | null
  ) => Promise<MessageBoxData>)

export interface IZMessageBox {
  _context: AppContext | null

  /** Show a message box */
  (
    options: ZMessageBoxOptions,
    appContext?: AppContext | null
  ): Promise<MessageBoxData>

  /** Show an alert message box */
  alert: ZMessageBoxShortcutMethod

  /** Show a confirm message box */
  confirm: ZMessageBoxShortcutMethod

  /** Show a prompt message box */
  prompt: ZMessageBoxShortcutMethod

  /** Close current message box */
  close(): void
}
