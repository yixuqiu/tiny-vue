<template>
  <div class="tiny-statistic">
    <div class="tiny-statistic__title">
      <div v-if="title && typeof title === 'string'">
        {{ title }}
      </div>
      <div v-else-if="$slots.title">
        <slot name="title" :data="title">
          {{ title }}
        </slot>
      </div>
    </div>
    <div class="tiny-statistic__slots">
      <div v-if="$slots.prefix || prefix" class="tiny-statistic__prefix">
        <slot name="prefix">
          <span>{{ prefix }}</span>
        </slot>
      </div>
      <span class="tiny-statistic__description" :style="valueStyle">
        {{ state.value }}
      </span>
      <div v-if="$slots.suffix || suffix" class="tiny-statistic__suffix">
        <slot name="suffix">
          <span>{{ suffix }}</span>
        </slot>
      </div>
    </div>
    <div v-if="title && title instanceof Object" :class="['tiny-statistic__footer-title', 'tiny-statistic__title']">
      <div v-if="$slots.title">
        <slot name="title" :data="title"> </slot>
      </div>
      <div v-else>
        <span>{{ title.value }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { renderless, api } from '@opentiny/vue-renderless/statistic/vue'
import { props, setup, defineComponent } from '@opentiny/vue-common'

export default defineComponent({
  components: {},
  emits: [],
  props: [...props, 'formatter', 'precision', 'prefix', 'suffix', 'title', 'value', 'valueStyle', 'groupSeparator'],
  setup(props, context) {
    return setup({ props, context, renderless, api })
  }
})
</script>
