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
      format: props.format || '',
      value: props.modelValue
    })
  ) as Color
  const showPicker = ref(false)
  const showPanel = ref(false)
  const input = ref('')
  const hue = ref()
  const sv = ref()
  const alpha = ref()
  const panelColor = computed(() => {
    if (!props.modelValue && !showPanel.value) {
      return 'transparent'
    }
    return panelRgb(color, props.alpha)
  })
  const currentColor = computed(() => {
    return !props.modelValue && !showPanel.value ? '' : color.value
  })
  return {
    color,
    showPicker,
    input,
    panelColor,
    currentColor,
    showPanel,
    hue,
    sv,
    alpha
  }
}

export const initWatch = (
  props: IColorSelectPanelProps,
  { watch, onMounted, watchEffect }: ISharedRenderlessParamHooks,
  { emit }: ISharedRenderlessParamUtils,
  { input, showPanel, color, currentColor, showPicker, hue, sv, alpha }: ReturnType<typeof initState>
) => {
  let dirty = true
  onMounted(() => {
    if (props.modelValue) {
      input.value = currentColor.value
    }
  })
  watch(
    () => props.modelValue,
    () => {
      if (!props.modelValue) {
        showPanel.value = false
      } else if (props.modelValue && props.modelValue !== color.value) {
        dirty = false
        color.fromString(props.modelValue)
      }
    }
  )
  watchEffect(() => {
    color.enableAlpha = props.alpha
    color.format = props.format || color.format
    color.onChange()
    updateModelValue(color.value, emit)
  })
  watch(
    () => currentColor.value,
    () => {
      input.value = currentColor.value
      if (dirty) {
        triggerColorUpdate(currentColor.value, emit)
      }
      dirty = true
    }
  )
  watch(
    () => color.value,
    () => {
      if (!props.modelValue && !showPanel.value) {
        showPanel.value = true
      }
    }
  )
  watch(
    () => showPicker.value,
    () => {
      if (hue.value) {
        hue.value.update()
      }
      if (sv.value) {
        sv.value.update()
      }
      if (alpha.value) {
        alpha.value.update()
      }
    }
  )
}
