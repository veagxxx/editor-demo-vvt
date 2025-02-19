<template>
  <Transition name="fade-in-linear" @after-leave="$emit('vanish')">
    <el-overlay v-show="visible" :z-index="zIndex" :overlay-class="[ns.is('message-box'), '']" :mask="modal">
      <div 
        role="dialog" 
        :aria-label="title" 
        aria-modal="true" 
        :aria-describedby="undefined" 
        :class="`${ns.namespace.value}-overlay-message-box`"
        @click="overlayEvent.onClick"
        @mousedown="overlayEvent.onMousedown"
        @mouseup="overlayEvent.onMouseup"
      >
        <div 
          ref="rootRef"
          :class="[
            ns.b(),
            customClass,
            ns.is('draggable', draggable),
            ns.is('hidden', !visible),
            { [ns.m('center')]: center },
          ]"
          :style="contentStyle"
        >
          <div
            v-if="title !== null && title !== undefined"
            ref="headerRef"
            :class="[ns.e('header'), { 'show-close': showClose }]"
          >
            <div :class="ns.e('title')">
              <el-icon
                v-if="iconComponent && center"
                :class="[ns.e('status'), typeClass]"
              >
                <component :is="iconComponent" />
              </el-icon>
              <span>{{ title }}</span>
            </div>
            <button
              v-if="showClose"
              type="button"
              :class="ns.e('headerbtn')"
              @click="
                handleAction(distinguishCancelAndClose ? 'close' : 'cancel')
              "
              @keydown.prevent.enter="
                handleAction(distinguishCancelAndClose ? 'close' : 'cancel')
              "
            >
              <el-icon :class="ns.e('close')">
                <Close />
              </el-icon>
            </button>
          </div>
          <div :class="ns.e('content')">
            <div :class="ns.e('container')">
              <el-icon
                v-if="iconComponent && !center && hasMessage"
                :class="[ns.e('status'), typeClass]"
              >
                <component :is="iconComponent" />
              </el-icon>
              <div v-if="hasMessage" :class="ns.e('message')">
                <slot>
                  <component
                    v-if="!dangerouslyUseHTMLString"
                    :is="'p'"
                  >
                    {{ !dangerouslyUseHTMLString ? message : '' }}
                  </component>
                  <component
                    v-else
                    :is="'p'"
                    v-html="message"
                  />
                </slot>
              </div>
            </div>
          </div>
          <div :class="ns.e('btns')">
            <template v-if="footer">
              <component :is="footerComponent(footer)"></component>
            </template>
            <template v-else>
              <template v-for="button in prependButtons" :key="button.buttonText" >
                <el-button
                  :type="getButtonType(button)"
                  :size="button.size || btnSize"
                  :loading="button.loading"
                  :class="[button.customClass]"
                  :round="button.round"
                  :icon="button.icon"
                  :loading-icon="button.loadingIcon || Loading"
                  @click="onButtonClick(button)"
                >
                  {{ button.text  }}
                </el-button>
              </template>
              <el-button
                v-if="showCancelButton"
                :loading="cancelButtonLoading"
                :loading-icon="cancelButtonLoadingIcon"
                :class="[cancelButtonClass]"
                :round="roundButton"
                :size="btnSize"
                @click="handleAction('cancel')"
                @keydown.prevent.enter="handleAction('cancel')"
              >
                {{ cancelButtonText || '取消' }}
              </el-button>
              <el-button
                v-show="showConfirmButton"
                ref="confirmRef"
                type="primary"
                :loading="confirmButtonLoading"
                :loading-icon="confirmButtonLoadingIcon"
                :class="[confirmButtonClasses]"
                :round="roundButton"
                :disabled="confirmButtonDisabled"
                :size="btnSize"
                @click="handleAction('confirm')"
                @keydown.prevent.enter="handleAction('confirm')"
              >
                {{ confirmButtonText || '确定' }}
              </el-button>
              <template v-for="button in appendButtons" :key="button.buttonText" >
                <el-button
                  :type="getButtonType(button)"
                  :size="button.size || btnSize"
                  :loading="button.loading"
                  :class="[button.customClass]"
                  :round="button.round"
                  :icon="button.icon"
                  :loading-icon="button.loadingIcon || Loading"
                  @click="onButtonClick(button)"
                >
                  {{ button.text  }}
                </el-button>
              </template>
            </template>
          </div>
        </div>
      </div>
    </el-overlay>
  </Transition>
</template>

<script lang="ts">
import {
  computed,
  CSSProperties,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  reactive,
  ref,
  toRefs
} from 'vue';
import { 
  ComponentSize,
  useGlobalComponentSettings,
  useSameTarget,
  useDraggable,
  ButtonType
} from 'element-plus';
import { MessageBoxState, Action, MessageBoxType, ZMessageBoxButton, Footer } from './message-box.type';
import { 
  CircleCloseFilled,
  InfoFilled,
  Loading,
  SuccessFilled,
  WarningFilled,
  Close 
} from '@element-plus/icons-vue';
import { offset } from '../utils/offset';

export const TypeComponentsMap = {
  success: SuccessFilled,
  warning: WarningFilled,
  error: CircleCloseFilled,
  info: InfoFilled,
}
export default defineComponent({
  name: 'ZMessageBox',
  components: {
    Close,
    Loading,
    ...TypeComponentsMap
  },
  inheritAttrs: false,
  props: {
    buttonSize: {
      type: String as PropType<ComponentSize>,
    },
    modal: {
      type: Boolean,
      default: true,
    },
    lockScroll: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },
    closeOnHashChange: {
      type: Boolean,
      default: true,
    },
    center: Boolean,
    draggable: Boolean,
    overflow: Boolean,
    roundButton: {
      default: false,
      type: Boolean,
    },
    container: {
      type: String, // default append to body
      default: 'body',
    },
    boxType: {
      type: String as PropType<MessageBoxType>,
      default: '',
    },
  },
  emits: ['vanish', 'action'],
  setup(props, { emit }) {
    const { ns, zIndex, size: btnSize } = useGlobalComponentSettings(
      'message-box',
      computed(() => props.buttonSize)
    );
    const visible = ref(false);
    const rootRef = ref<HTMLElement>();
    const headerRef = ref<HTMLElement>();
    const { nextZIndex } = zIndex;
    const state = reactive<MessageBoxState>({
      buttons: [],
      footer: null,
      autofocus: true,
      beforeClose: null,
      callback: null,
      cancelButtonText: '',
      cancelButtonClass: '',
      confirmButtonText: '',
      confirmButtonClass: '',
      customClass: '',
      customStyle: {},
      dangerouslyUseHTMLString: false,
      distinguishCancelAndClose: false,
      icon: '',
      message: '',
      modalFade: true,
      modalClass: '',
      showCancelButton: false,
      showConfirmButton: true,
      type: '',
      title: '',
      action: '' as Action,
      confirmButtonLoading: false,
      cancelButtonLoading: false,
      confirmButtonLoadingIcon: Loading,
      cancelButtonLoadingIcon: Loading,
      confirmButtonDisabled: false,
      editorErrorMessage: '',
      validateError: false,
      zIndex: nextZIndex(),
      done: false,
      cancelButtonActionDone: false,
      confirmButtonActionDone: false
    });

    const mousePosition = ref<{ x: number; y: number } | null>(null);

    // 展开动画起点
    const transformOrigin = computed(() => {
      if (!rootRef.value) {
        return '';
      }
      const elementOffset = offset(rootRef.value!);
      const width = rootRef.value!.offsetWidth;
      const height = rootRef.value!.offsetHeight;
      console.log('transformOrigin', elementOffset, mousePosition.value);
      return mousePosition.value 
        ? `${mousePosition.value.x - elementOffset.left + width / 2}px ${
          mousePosition.value.y - elementOffset.top + height / 2}px`
        : '';
    });
    // message box 样式
    const contentStyle = computed(() => {
      const style: CSSProperties = {};
      if (transformOrigin.value) {
        style.transformOrigin = transformOrigin.value;
      }
      return style;
    });

    const hasMessage = computed(() => !!state.message);

    const typeClass = computed(() => {
      const type = state.type;
      return { [ns.bm('icon', type)]: type && TypeComponentsMap[type] };
    });
    const iconComponent = computed(
      // @ts-ignore
      () => state.icon || TypeComponentsMap[state.type] || ''
    );
    const draggable = computed(() => props.draggable);
    const overflow = computed(() => props.overflow);
    useDraggable(rootRef, headerRef, draggable, overflow);

    const confirmButtonClasses = computed(() => state.confirmButtonClass);

    // prepend buttons
    const prependButtons = computed(() => {
      return state.buttons
        ? state.buttons.filter(button => !button.slot || button.slot === 'prepend')
        : [];
    });
    // append buttons
    const appendButtons = computed(() => {
      return state.buttons
        ? state.buttons.filter(button => button.slot === 'append')
        : [];
    });

    // 鼠标位置动画展开
    function getClickPosition(event: MouseEvent)
    {
      if (visible.value && !mousePosition.value) {
        mousePosition.value = {
          x: event.pageX,
          y: event.pageY,
        };
      }
    }

    function doClose() {
      if (!visible.value) return;
      visible.value = false;
      nextTick(() => {
        if (state.action) {
          emit('action', state.action);
        }
      });
      resetPosition();
    }

    function resetPosition()
    {
      rootRef.value!.onanimationend = () => {
        mousePosition.value = null;
        rootRef.value!.onanimationend = null;
      };
    }

    const handleWrapperClick = () => {
      if (props.closeOnClickModal) {
        handleAction(state.distinguishCancelAndClose ? 'close' : 'cancel');
      }
    }

    const overlayEvent = useSameTarget(handleWrapperClick);

    const handleAction = (action: Action) => {
      if (props.boxType === 'prompt' && action === 'confirm') {
        return;
      }

      state.action = action;

      if (state.beforeClose) {
        state.beforeClose?.(action, state, doClose);
      } else {
        doClose();
      }
    }

    const handleClose = () => {
      handleAction('close');
    }

    const onCloseRequested = () => {
      if (props.closeOnPressEscape) {
        handleClose();
      }
    }

    function onButtonClick(button: ZMessageBoxButton)
    {
      if (button.action && ['cancel', 'close', 'confirm'].includes(button.action)) {
        handleAction(<Action>button.action);
        return;
      }
      button.onClick && button.onClick(button.action, () => handleAction('custom'));
    }

    function getButtonType(button: ZMessageBoxButton): ButtonType
    {
      let type = button.type ?? '';
      if (button.action === 'confirm')
      {
        type = 'primary';
      }
      return type;
    }

    function handleActionForFooter(action?: string)
    {
      if (action && ['cancel', 'close', 'confirm'].includes(action)) {
        handleAction(<Action>action);
        return;
      }
      doClose();
    }

    function footerComponent(footer: Footer)
    {
      if (footer) {
        return footer(handleActionForFooter);
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', getClickPosition);
    });

    onMounted(async () => {
      await nextTick();
      if (props.closeOnHashChange) {
        window.addEventListener('hashchange', doClose);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', getClickPosition);
      if (props.closeOnHashChange) {
        window.removeEventListener('hashchange', doClose);
      }
    });

    return {
      ns,
      visible,
      overlayEvent,
      rootRef,
      headerRef,
      iconComponent,
      typeClass,
      hasMessage,
      btnSize,
      confirmButtonClasses,
      contentStyle,
      Loading,
      prependButtons,
      appendButtons,
      ...toRefs(state),
      onCloseRequested,
      handleAction,
      onButtonClick,
      getButtonType,
      footerComponent
    };
  },
})

</script>

<style lang="scss" scoped>
  .el-message-box__status {
    font-size: 24px;
  }
  .el-message-box {
    animation: scale-in var(--el-transition-duration) cubic-bezier(0.08, 0.82, 0.17, 1);
    &.is-hidden {
      animation: scale-out var(--el-transition-duration) cubic-bezier(0.78, 0.14, 0.15, 0.86);
    }
  }
  @keyframes scale-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes scale-out {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0);
      opacity: 0;
    }
  }
</style>
