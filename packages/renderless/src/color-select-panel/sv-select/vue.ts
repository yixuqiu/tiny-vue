import type { IColorSelectPanelSVProps, ISharedRenderlessParamHooks, ISharedRenderlessParamUtils } from '@/types'
import type { Color } from '../utils/color'
import { getClientXY } from '../utils/getClientXY'
import { draggable } from '../utils/use-drag'

export const api = ['state', 'wrapper', 'cursor']
export const renderless = (
  props: IColorSelectPanelSVProps<Color>,
  { onMounted, watch, ref, computed, reactive }: ISharedRenderlessParamHooks,
  { emit }: ISharedRenderlessParamUtils
) => {
  const cursorTop = ref(0)
  const cursorLeft = ref(0)
  const bg = ref('hsl(0, 100%, 50%)')
  const colorValue = computed(() => {
    const hue = props.color.get('hue')
    const value = props.color.get('value')
    return { hue, value }
  })
  const wrapper = ref<HTMLElement>()

  const state = reactive({
    colorValue,
    bg,
    cursorTop,
    cursorLeft
  })

  const update = () => {
    const el = wrapper.value
    if (!el) {
      return
    }
    const sat = props.color.get('sat')
    const value = props.color.get('value')
    const { clientWidth: width, clientHeight: height } = el

    cursorLeft.value = (sat * width) / 100
    cursorTop.value = ((100 - value) * height) / 100
    bg.value = `hsl(${props.color.get('hue')}, 100%, 50%)`
  }

  const onDrag = (event: MouseEvent | TouchEvent) => {
    const el = wrapper.value!
    const rect = el.getBoundingClientRect()
    const { clientX, clientY } = getClientXY(event)
    let left = clientX - rect.left
    let top = clientY - rect.top
    left = Math.max(0, left)
    left = Math.min(left, rect.width)

    top = Math.max(0, top)
    top = Math.min(top, rect.height)

    cursorLeft.value = Math.max(left, 0)
    cursorTop.value = Math.max(top, 0)

    const s = (left / rect.width) * 100
    const v = 100 - (top / rect.height) * 100

    emit('svUpdate', { s, v })

    props.color.set({
      sat: s,
      value: v
    })
  }

  watch(
    () => colorValue.value,
    () => update()
  )
  onMounted(() => {
    const drag = {
      drag: (event: MouseEvent | TouchEvent) => {
        onDrag(event)
      },
      end: (event: MouseEvent | TouchEvent) => {
        onDrag(event)
      }
    }
    draggable(wrapper.value!, drag)
    update()
    emit('ready', update)
  })
  const api = { state, wrapper }
  return api
}
