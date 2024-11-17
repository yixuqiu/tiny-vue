import type { IColorSelectPanelProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import { Color } from './utils/color'

export const panelRgb = (color: Color, alpha: boolean) => {
  const { r, g, b } = color.toRgb()
  return alpha ? `rgba(${r},${g},${b},${color.get('alpha') / 100})` : `rgb(${r},${g},${b})`
}

export const updateModelValue = (value: string | null, emit: ISharedRenderlessParamUtils['emit']) => {
  emit('update:modelValue', value)
}

export const triggerCancel = (value: string | null, emit: ISharedRenderlessParamUtils['emit']) => {
  emit('cancel')
}

export const triggerColorUpdate = (value: string | null, emit: ISharedRenderlessParamUtils['emit']) => {
  emit('color-update', value)
}

export const triggerConfirm = (value: string | null, emit: ISharedRenderlessParamUtils['emit']) => {
  emit('confirm', value)
}

export const initState = (
  props: IColorSelectPanelProps,
  { reactive, ref, computed, nextTick }: ISharedRenderlessParamHooks,
  { emit }: ISharedRenderlessParamUtils
) => {
  const color = reactive(
    new Color({
      enableAlpha: props.alpha,
      format: props.format ?? '',
      value: props.modelValue
    })
  ) as Color
  const input = ref<string>('')
  const showPicker = ref(props.visible)
  const showPanel = ref(false)
  const panelColor = computed(() => {
    if (!props.modelValue && !showPanel.value) {
      return 'transparent'
    }
    return panelRgb(color, props.alpha)
  })
  const currentColor = computed(() => (!props.modelValue && !showPicker.value ? '' : color.value))

  const stack = ref<string[]>([...(props.history ?? [])])
  const predefineStack = computed(() => props.predefine)
  const hue = ref()
  const sv = ref()
  const alpha = ref()
  const state = reactive({
    color,
    input,
    showPicker,
    showPanel,
    panelColor,
    currentColor,
    hue,
    sv,
    alpha,
    stack,
    predefineStack,
    enablePredefineColor: computed(() => props.predefine?.length),
    enableHistory: computed(() => props.history?.length)
  })
  return state
}

export const initWatch = (
  state: ReturnType<typeof initState>,
  props: IColorSelectPanelProps,
  { nextTick, watch }: ISharedRenderlessParamHooks,
  { emit }: ISharedRenderlessParamUtils
) => {
  watch(
    () => state.color,
    () => {
      emit('color-update', state.color)
    }
  )
  watch(
    () => props.visible,
    () => {
      state.showPicker = props.visible
    }
  )
  watch(
    () => props.modelValue,
    () => {
      if (!props.modelValue) {
        state.showPanel = false
      }
      if (props.modelValue && props.modelValue !== state.color.value) {
        state.color.fromString(props.modelValue)
      }
    }
  )
  /**
   * @description 预留了一个 format props类型
   * @description 2024/11/17 尚未实现
   * @see https://github.com/opentiny/tiny-vue/issues/2514
   */
  watch(
    () => [props.format, props.alpha],
    () => {
      state.color.enableAlpha = props.alpha
      state.color.format = props.format || state.color.format
      state.color.onChange()
      updateModelValue(state.color.value, emit)
    }
  )
  watch(
    () => state.currentColor,
    () => {
      state.input = state.currentColor
      triggerColorUpdate(state.input, emit)
    },
    { flush: 'sync' }
  )
  watch(state.color, () => {
    if (!props.modelValue && !state.showPanel) {
      state.showPanel = true
    }
  })
  watch(
    () => state.showPicker,
    () => {
      nextTick(() => {
        if (state.hue) {
          state.hue.update()
        }
        if (state.sv) {
          state.sv.update()
        }
        if (state.alpha) {
          state.alpha.update()
        }
      })
    }
  )
  watch(
    () => props.history,
    () => {
      state.stack = props.history
    },
    { deep: true }
  )
}
