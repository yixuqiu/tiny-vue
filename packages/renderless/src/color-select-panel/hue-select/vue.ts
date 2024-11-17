import type { IColorSelectPanelHueProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import type { Color } from '../utils/color'
import { getClientXY } from '../utils/getClientXY'
import { draggable } from '../utils/use-drag'

export const api = ['state', 'onSvReady', 'bar', 'thumb', 'wrapper']

export const renderless = (
  props: IColorSelectPanelHueProps<Color>,
  { onMounted, reactive, ref, computed }: ISharedRenderlessParamHooks,
  { emit }: ISharedRenderlessParamUtils
) => {
  const thumb = ref<HTMLElement>()
  const bar = ref<HTMLElement>()
  const wrapper = ref<HTMLElement>()
  const cursor = ref<HTMLElement>()

  const thumbLeft = ref(0)
  const thumbTop = ref(0)
  const hueValue = computed(() => props.color.get('hue'))
  const state = reactive({ hueValue, thumb, bar, wrapper, thumbTop })
  const onSvReady = (update) => {
    emit('svReady', update)
  }
  const api = {
    state,
    onSvReady,
    bar,
    thumb,
    wrapper
  }
  const getThumbLeft = () => {
    if (!thumb.value) {
      return 0
    }
    const hue = props.color.get('hue')
    if (!wrapper.value) {
      return 0
    }
    return Math.round((hue * (wrapper.value.offsetWidth - thumb.value.offsetWidth / 2)) / 360)
  }
  const getThumbTop = () => {
    if (!thumb.value) {
      return 0
    }
    const hue = props.color.get('hue')
    if (!bar.value) {
      return 0
    }
    return (hue * (bar.value.offsetHeight - thumb.value.offsetHeight / 2)) / 360
  }
  const update = () => {
    thumbLeft.value = getThumbLeft()
    thumbTop.value = getThumbTop()
  }
  const onDrag = (event: MouseEvent | TouchEvent) => {
    if (!bar.value || !thumb.value) {
      return
    }
    const el = bar.value
    if (!el) {
      return
    }
    const rect = el?.getBoundingClientRect()
    const { clientY } = getClientXY(event)
    let top = clientY - rect.top

    top = Math.min(top, rect.height - thumb.value.offsetHeight / 2)
    top = Math.max(thumb.value.offsetHeight / 2, top)
    const hue = Math.round(((top - thumb.value.offsetHeight / 2) / (rect.height - thumb.value.offsetHeight)) * 360)
    thumbTop.value = top
    emit('hueUpdate', hue)
    props.color.set('hue', hue)
  }
  onMounted(() => {
    if (!bar.value || !thumb.value) {
      return
    }
    const dragConfig = {
      drag: (event: MouseEvent | TouchEvent) => {
        onDrag(event)
      },
      end: (event: MouseEvent | TouchEvent) => {
        onDrag(event)
      }
    }
    draggable(bar.value, dragConfig)
    draggable(thumb.value, dragConfig)
    emit('hueReady', update)
    update()
  })
  return api
}
