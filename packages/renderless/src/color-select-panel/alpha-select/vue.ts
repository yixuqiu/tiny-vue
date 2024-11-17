import type { IColorSelectPanelAlphProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import type { Color } from '../utils/color-new'
import { getClientXY } from '../utils/getClientXY'
import { draggable } from '../utils/use-drag'

export const api = ['state', 'color', 'slider', 'alphaWrapper', 'alphaThumb', 'onClick']

export const renderless = (
  props: IColorSelectPanelAlphProps<Color>,
  { onMounted, watch, ref, reactive }: ISharedRenderlessParamHooks,
  { emit }: ISharedRenderlessParamUtils
) => {
  const slider = ref<HTMLElement>()
  const alphaWrapper = ref<HTMLElement>()
  const alphaThumb = ref<HTMLElement>()
  const left = ref(0)
  const background = ref('')
  const state = reactive({
    background,
    left
  })
  const onDrag = (event: MouseEvent | TouchEvent) => {
    if (!slider.value || !alphaThumb.value) {
      return
    }
    const el = alphaWrapper.value!
    const rect = el.getBoundingClientRect()
    const { clientX } = getClientXY(event)
    let left = clientX - rect.left
    left = Math.max(alphaThumb.value.offsetWidth / 2, left)
    left = Math.min(left, rect.width - alphaThumb.value.offsetWidth / 2)
    const alpha = Math.round(
      ((left - alphaThumb.value.offsetWidth / 2) / (rect.width - alphaThumb.value.offsetWidth)) * 100
    )
    props.color.set('alpha', alpha)
  }
  const onClick = (event: MouseEvent | TouchEvent) => {
    if (event.target !== alphaThumb.value) {
      onDrag(event)
    }
  }
  const getLeft = () => {
    const thumb = alphaThumb.value
    if (!thumb) {
      return 0
    }
    const el = alphaWrapper.value
    if (!el) {
      return 0
    }
    const alpha = props.color.get('alpha')
    return (alpha * (el.offsetWidth - thumb.offsetWidth / 2)) / 100
  }

  const getBackground = () => {
    if (props.color && props.color.value) {
      const { r, g, b } = props.color.toRgb()
      return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`
    }
    return ''
  }

  const update = () => {
    left.value = getLeft()
    background.value = getBackground()
  }
  onMounted(() => {
    if (!slider.value || !alphaThumb.value) {
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
    draggable(slider.value, dragConfig)
    draggable(alphaThumb.value, dragConfig)
    update()
    emit('ready', update)
  })

  watch(
    () => props.color.get('alpha'),
    () => update(),
    { deep: true }
  )
  watch(
    () => props.color,
    () => update(),
    { deep: true }
  )
  const api = {
    state,
    slider,
    alphaWrapper,
    alphaThumb,
    onClick
  }
  return api
}
