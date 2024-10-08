<docs>
  TODO:
  - [ ] support input buttons and type = submit || reset
  - [ ] support block attribute
</docs>

<template>
  <a v-if="anchor" role="button" :class="classes">
    <slot>Anchor</slot>
  </a>
  <button v-else type="button" :class="classes">
    <slot>Button</slot>
  </button>
</template>

<script>
/**
  A simple bootstrap button component.  Mainly saves remembering required class names.
 */
export default {
  name: 't-button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator(value) {
        // The value must match one of these strings
        return [
          'primary',
          'secondary',
          'success',
          'danger',
          'warning',
          'info',
          'light',
          'dark',
          'link'
        ].includes(value)
      }
    },
    outline: Boolean,
    anchor: Boolean,
    size: {
      type: String,
      required: false,
      validator(value) {
        return ['small', 'large'].includes(value)
      }
    }
  },
  computed: {
    classes() {
      let result = { btn: true }
      if (this.outline) {
        result['btn-outline-' + this.variant] = true
      } else {
        result['btn-' + this.variant] = true
      }
      if (this.size == 'large') {
        result['btn-lg'] = true
      }
      if (this.size == 'small') {
        result['btn-sm'] = true
      }
      return result
    }
  }
}
</script>
