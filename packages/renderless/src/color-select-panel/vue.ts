import type { IColorSelectPanelProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import { initState, initWatch, triggerCancel, triggerConfirm, updateModelValue } from './index'
import { Color } from './utils/color'
import { onMounted } from 'vue'

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
  initWatch(state, props, hooks, utils)
  onMounted(() => {
    if (props.modelValue) {
      state.input = state.currentColor
    }
  })
  return api
}
