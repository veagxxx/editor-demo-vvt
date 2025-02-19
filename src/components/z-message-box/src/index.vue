<template>
  <div class="zee-message-box">
    <el-dialog
      v-model="visible"
      align-center
      :title="title"
      :close-on-click-modal="closeOnClickModal"
      :destroy-on-close="destroyOnClose"
      :draggable="draggable" 
      :center="center"
      :width="width"
      :style="contentStyle"
      :class="{ 'is-hidden': !visible }"
      ref="rootRef"
    >
      <div class="zee-message-box__content">
        <div class="zee-message-box__container">
          <!-- <el-icon
            v-if="iconComponent && !center && hasMessage"
            :class="[ns.e('status'), typeClass]"
          >
            <component :is="iconComponent" />
          </el-icon> -->
          <div v-if="hasMessage" class="zee-message-box__message">
            <slot>
              <component v-if="!dangerouslyUseHTMLString" is="p">
                {{ !dangerouslyUseHTMLString ? message : '' }}{{ mousePosition }}
              </component>
              <component v-else is="p" v-html="message" />
            </slot>
          </div>
        </div>
      </div>
      <template #footer>
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
          {{ cancelButtonText }}
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
          {{ confirmButtonText }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { ComponentSize, ElDialog, ElButton } from 'element-plus';
import { computed, CSSProperties, defineComponent, nextTick, onMounted, PropType, reactive, ref, toRefs } from 'vue';
import { Action, IZeeMessageBoxState, MessageBoxType } from './message-box.type';
import { offset } from './offset';


export default defineComponent({
  name: 'ZeeMessageBox',
  components: { Loading, ElDialog, ElButton },
  inheritAttrs: false,
  props: {
    buttonSize: {
      type: String as PropType<ComponentSize>,
      default: 'default',
    },
    roundButton: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: false,
    },
    container: {
      type: String, // default append to body
      default: 'body',
    },
    draggable: Boolean,
    center: Boolean,
    width: {
      type: [String, Number],
      default: 450,
    },
    boxType: {
      type: String as PropType<MessageBoxType>,
      default: '',
    },
  },
  emits: ['vanish', 'action'],
  setup(props, { emit }) {
    const visible = ref<boolean>(false);
    const state = reactive<IZeeMessageBoxState>({
      title: '提示',
      message: '',
      action: '' as Action,
      beforeClose: null,
      destroyOnClose: true,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '确认',
      cancelButtonClass: '',
      confirmButtonClasses: '',
      cancelButtonLoading: false,
      confirmButtonLoading: false,
      cancelButtonLoadingIcon: Loading,
      confirmButtonLoadingIcon: Loading,
      confirmButtonDisabled: false,
      dangerouslyUseHTMLString: false,
      distinguishCancelAndClose: false,
    });
    const rootRef = ref<InstanceType<typeof ElDialog>>();

    const hasMessage = computed(() => !!state.message);

    const mousePosition = ref<{ x: number; y: number } | null>(null);

    // 展开动画起点
    const transformOrigin = computed(() => {
      if (!rootRef.value || !rootRef.value.dialogContentRef) {
        return '';
      }
      const rootEl = rootRef.value.dialogContentRef.$el;
      const elementOffset = offset(rootEl);
      const width = rootEl.offsetWidth;
      const height = rootEl.offsetHeight;
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

    function doClose()
    {
      if (!visible.value) return;
      visible.value = false;
      nextTick(() => {
        if (state.action) {
          emit('action', state.action);
        }
      });
    }

    const handleAction = (action: Action) => {

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

    function getClickPosition(event: MouseEvent)
    {
      if (visible.value && !mousePosition.value) {
        mousePosition.value = {
          x: event.pageX,
          y: event.pageY,
        };
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', getClickPosition);
    });


    return {
      ...toRefs(state),
      rootRef,
      visible,
      btnSize: props.buttonSize,
      Loading,
      contentStyle,
      hasMessage,
      mousePosition,
      handleAction,
      handleClose
    }
  },
});
</script>

<style lang="scss" scoped>
  .zee-message-box {
    :deep(.el-dialog) {
      animation: scale-in var(--el-transition-duration) cubic-bezier(0.08, 0.82, 0.17, 1);
      &.is-hidden {
        animation: scale-out var(--el-transition-duration) cubic-bezier(0.78, 0.14, 0.15, 0.86);
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
    }
    &__content {
      color: var(--el-messagebox-content-color);
      font-size: var(--el-messagebox-content-font-size);
    }
    &__container {
      display: flex;
      align-items: center;
      gap: 12px
    }
    &__message p {
      margin: 0;
      line-height: var(--el-messagebox-font-line-height);
    }
  }
</style>
