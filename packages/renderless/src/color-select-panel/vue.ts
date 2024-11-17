import type { IColorSelectPanelProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import { initState, triggerCancel, triggerColorUpdate, triggerConfirm, updateModelValue } from './index'
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
  'onHistoryClick',
  'onClickOutside'
]

export const renderless = (
  props: IColorSelectPanelProps,
  hooks: ISharedRenderlessParamHooks,
  utils: ISharedRenderlessParamUtils
) => {
  const { nextTick } = hooks
  const { emit } = utils
  const state = initState(props, hooks, utils)

  const setShowPicker = (value: boolean) => (state.showPicker = value)

  const onPredefineColorClick = (predefineColor: string) => {
    state.color.fromString(predefineColor)
  }
  const onHistoryClick = (historyColor: string) => {
    state.color.fromString(historyColor)
  }
  const open = () => {
    setShowPicker(true)
  }
  const close = () => {
    setShowPicker(false)
  }
  const resetColor = () => {
    nextTick(() => {
      if (props.modelValue) {
        state.color.fromString(props.modelValue)
      } else {
        state.color.value = ''
        nextTick(() => {
          state.showPanel = false
        })
      }
    })
  }
  const onConfirm = () => {
    submitValue()
    let index = state.stack.indexOf(state.input)
    if (index === -1) {
      state.stack.push(state.input)
    } else {
      state.stack = [state.input, ...state.stack.filter((c, i) => i !== index)]
    }
  }
  const onCancel = () => {
    resetColor()
    close()
    emit('cancel')
  }
  const submitValue = () => {
    const value = state.color.value
    updateModelValue(value, emit)
    triggerConfirm(value, emit)
    setShowPicker(false)
    nextTick(() => {
      const newColor = new Color({
        enableAlpha: props.alpha,
        format: props.format ?? '',
        value: props.modelValue
      })
      if (!state.color.compare(newColor)) {
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
    if (!state.showPicker) {
      return
    }
    close()
    resetColor()
    emit('cancel')
  }
  const onHueReady = (update) => {
    state.hue = { update }
  }
  const onSvReady = (update) => {
    state.sv = { update }
  }
  const onAlphaReady = (update) => {
    state.alpha = { update }
  }

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
    onHistoryClick,
    onClickOutside
  }
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
  onMounted(() => {
    if (props.modelValue) {
      state.input = state.currentColor
    }
  })
  watch(
    () => props.modelValue,
    (newValue) => {
      if (!newValue) {
        state.showPanel = false
      }
      if (newValue && newValue !== state.color.value) {
        state.color.fromString(newValue)
      }
    }
  )
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
  return api
}
