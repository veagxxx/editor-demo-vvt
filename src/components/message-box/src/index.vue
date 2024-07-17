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
            { [ns.m('center')]: center },
          ]"
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
            <template v-for="button in footers" :key="button.buttonText" >
              <el-button
                :type="getButtonType(button)"
                :size="button.buttonSize || btnSize"
                :loading="button.loading"
                :class="[button.customClass]"
                :round="button.round"
                @click="($event) => onButtonClick(button, $event)"
              >
                {{ button.buttonText  }}
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
          </div>
        </div>
      </div>
    </el-overlay>
  </Transition>
</template>

<script lang="ts">
import { ComponentSize, useGlobalComponentSettings, useSameTarget, useDraggable, ButtonType } from 'element-plus';
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, reactive, ref, toRefs } from 'vue';
import { MessageBoxState, Action, MessageBoxType, ZMessageBoxFooter } from './message-box.type';
import { CircleCloseFilled, InfoFilled, Loading, SuccessFilled, WarningFilled, Close } from '@element-plus/icons-vue';

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
      footers: [],
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
    });

    const hasMessage = computed(() => !!state.message)
    const typeClass = computed(() => {
      const type = state.type
      return { [ns.bm('icon', type)]: type && TypeComponentsMap[type] }
    })
    const iconComponent = computed(
      // @ts-ignore
      () => state.icon || TypeComponentsMap[state.type] || ''
    )
    const draggable = computed(() => props.draggable);
    const overflow = computed(() => props.overflow);
    useDraggable(rootRef, headerRef, draggable, overflow);

    const confirmButtonClasses = computed(() => state.confirmButtonClass);

    onMounted(async () => {
      await nextTick()
      if (props.closeOnHashChange) {
        window.addEventListener('hashchange', doClose)
      }
    });

    onBeforeUnmount(() => {
      if (props.closeOnHashChange) {
        window.removeEventListener('hashchange', doClose)
      }
    });

    function doClose() {
      if (!visible.value) return;
      visible.value = false;
      nextTick(() => {
        if (state.action) {
          emit('action', state.action);
        }
      });
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
      handleAction('close')
    }

    const onCloseRequested = () => {
      if (props.closeOnPressEscape) {
        handleClose()
      }
    }

    function onButtonClick(button: ZMessageBoxFooter, $event: Event)
    {
      if (button.action) {
        handleAction(button.action);
        return;
      }
      button.onClick && button.onClick($event, handleClose);
    }

    function getButtonType(button: ZMessageBoxFooter): ButtonType
    {
      let type = button.buttonType ?? '';
      if (button.action === 'confirm')
      {
        type = 'primary';
      }
      return type;
    }

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
      ...toRefs(state),
      onCloseRequested,
      handleAction,
      onButtonClick,
      getButtonType,
    }
  },
})

</script>

<style lang="scss" scoped>
  .el-message-box__status {
    font-size: 24px;
  }
</style>
