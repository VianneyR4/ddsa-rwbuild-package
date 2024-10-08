<template>
  <div class="modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="header">
            <h5 class="modal-title">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="$emit('cancel')"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </slot>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="$emit('cancel')"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button type="button" class="btn btn-primary" @click="$emit('ok')">OK</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'

/**
 * A convenience component that wraps a bootstrap modal dialogue.  Saves several divs and some javascript initialisation.
 */
export default {
  name: 't-modal',
  props: {
    title: String
  },
  emits: ['cancel', 'ok'],
  data() {
    return {
      bsModal: null
    }
  },
  mounted() {
    this.bsModal = new Modal(this.$el)
  },
  unmounted() {
    this.bsModal.dispose()
  },
  methods: {
    show() {
      this.bsModal.show()
    },
    hide() {
      this.bsModal.hide()
    }
  }
}
</script>
