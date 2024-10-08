<template>
  <t-button
    ref="button"
    data-bs-toggle="popover"
    :data-bs-title="title"
    :data-bs-trigger="trigger"
    :data-bs-placement="placement"
    :data-bs-html="true"
    :variant="variant"
    :outline="outline"
    :size="size"
    anchor
    :tabindex="0"
    :class="classes"
  >
    <slot name="button">
      <font-awesome-icon icon="info-circle" />
    </slot>
  </t-button>
  <div ref="content" class="t-popover-content"><slot>Popover content</slot></div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Popover } from 'bootstrap'
import Button from './Button.vue'

/**
 * A bootstrap button where the default slot defines the contents of a popover with html content.
 */
export default {
  name: 't-popover-button',
  components: {
    't-button': Button,
    'font-awesome-icon': FontAwesomeIcon
  },
  props: {
    size: {
      type: String,
      required: false,
      validator(value) {
        return ['small', 'large'].includes(value)
      }
    },
    variant: {
      type: String,
      default: 'link',
      validator(value) {
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
    placement: {
      type: String,
      default: 'top',
      validator(value) {
        return ['top', 'bottom', 'right', 'left'].includes(value)
      }
    },
    trigger: {
      type: String,
      default: 'hover focus',
      validator(value) {
        // The value must match one of these strings
        return value.split(' ').every((item) => ['focus', 'hover', 'click'].includes(item))
      }
    },
    title: {
      type: String,
      required: false
    },
    form: Boolean, // if your popover is a form, we must manage the click event
    class: String
  },
  data() {
    return { popover: null }
  },
  mounted() {
    this.popover = new Popover(this.$refs.button.$el, {
      sanitize: this.form,
      content: this.$refs.content
    })
    // remove the content ref from the page (now that its been successfully injected into the popover)
    this.$refs.content.parentElement.removeChild(this.$refs.content)
    // adding the form flag makes it easier to close click trigger popovers
    if (this.form && this.trigger == 'click') {
      document.addEventListener('click', this.hideOnClickOutsideTooltip)
    }
  },
  beforeUnmount() {
    if (this.form && this.trigger == 'click') {
      document.removeEventListener('click', this.hideOnClickOutsideTooltip)
    }
  },
  unmounted() {
    if (this.popover) {
      this.popover.dispose()
    }
  },
  computed: {
    classes() {
      return this.class
    }
  },
  methods: {
    hideOnClickOutsideTooltip: function (event) {
      if (this.popover.tip) {
        if (document.getElementById(this.popover.tip.id).contains(event.target)) {
          this.$emit('click', event)
        } else {
          this.popover.hide()
        }
      }
    }
  }
}
</script>

<style scoped>
/* remove bottom margin of last element of popover content */
.t-popover-content :last-child {
  margin-bottom: 0;
}
</style>
