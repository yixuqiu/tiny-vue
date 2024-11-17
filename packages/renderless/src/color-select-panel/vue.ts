import type { IColorSelectPanelProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import { panelRgb, triggerCancel, triggerColorUpdate, triggerConfirm, updateModelValue } from './index'
import { Color } from './utils/color'
import { onMounted, watch } from 'vue'

export const api = [
  'state',
  'open',
  'close',
  'resetColor',
  'onConfirm',
  'onCancel',
  'submitValue',
  'clear',
  'onHueReady',
  'onSvReady',
  'onAlphaReady',
  'onPredefineColorClick',
  'onHistoryClick'
]

export const renderless = (
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
  const input = ref()
  const showPicker = ref(props.visible)
  const showPanel = ref(false)
  const panelColor = computed(() => {
    if (!props.modelValue && !showPanel.value) {
      return 'transparent'
    }
    return panelRgb(color, props.alpha)
  })
  const currentColor = computed(() => (!props.modelValue && !showPicker.value ? '' : color.value))

  const setShowPicker = (value: boolean) => (showPicker.value = value)

  const stack = ref<string[]>([...(props.history ?? [])])
  const predefineStack = computed(() => props.predefine)

  const onPredefineColorClick = (predefineColor: string) => {
    color.fromString(predefineColor)
  }
  const onHistoryClick = (historyColor: string) => {
    color.fromString(historyColor)
  }

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
  const open = () => {
    setShowPicker(true)
  }
  const close = () => {
    setShowPicker(false)
  }
  const resetColor = () => {
    nextTick(() => {
      if (props.modelValue) {
        color.fromString(props.modelValue)
      } else {
        color.value = ''
        nextTick(() => {
          showPanel.value = false
        })
      }
    })
  }
  const onConfirm = () => {
    submitValue()
    let index = stack.value.indexOf(input.value)
    if (index === -1) {
      stack.value.push(input.value)
    } else {
      stack.value = [input.value, ...stack.value.filter((c, i) => i !== index)]
    }
  }
  const onCancel = () => {
    onClickOutside()
    emit('cancel')
  }
  const submitValue = () => {
    const value = color.value
    updateModelValue(value, emit)
    triggerConfirm(value, emit)
    setShowPicker(false)
    nextTick(() => {
      const newColor = new Color({
        enableAlpha: props.alpha,
        format: props.format ?? '',
        value: props.modelValue
      })
      if (!color.compare(newColor)) {
        resetColor()
      }
    })
  }
  const clear = () => {
    updateModelValue(null, emit)
    triggerCancel(null, emit)
    resetColor()
  }
  const onClickOutside = () => {
    if (!showPicker.value) {
      return
    }
    close()
    emit('cancel')
  }
  const onHueReady = (update) => (hue.value = { update })
  const onSvReady = (update) => (sv.value = { update })
  const onAlphaReady = (update) => (alpha.value = { update })

  const api = {
    state,
    open,
    close,
    resetColor,
    onConfirm,
    onCancel,
    submitValue,
    clear,
    onHueReady,
    onSvReady,
    onAlphaReady,
    onPredefineColorClick,
    onHistoryClick
  }
  watch(
    () => props.visible,
    () => {
      state.showPicker = props.visible
    }
  )
  onMounted(() => {
    if (props.modelValue) {
      input.value = currentColor.value
    }
  })
  watch(
    () => props.modelValue,
    (newValue) => {
      if (!newValue) {
        showPanel.value = false
      }
      if (newValue && newValue !== color.value) {
        color.fromString(newValue)
      }
    }
  )
  watch(
    () => [props.format, props.alpha],
    () => {
      color.enableAlpha = props.alpha
      color.format = props.format || color.format
      color.onChange()
      updateModelValue(color.value, emit)
    }
  )
  watch(
    () => currentColor.value,
    () => {
      input.value = currentColor.value
      triggerColorUpdate(input.value, emit)
    },
    { flush: 'sync' }
  )
  watch(color, () => {
    if (!props.modelValue && !showPanel.value) {
      showPanel.value = true
    }
  })
  watch(
    () => showPicker.value,
    () => {
      nextTick(() => {
        if (hue.value) {
          hue.value.update()
        }
        if (sv.value) {
          sv.value.update()
        }
        if (alpha.value) {
          alpha.value.update()
        }
      })
    }
  )
  watch(
    () => props.history,
    () => {
      stack.value = props.history
    },
    { deep: true }
  )
  return api
}
