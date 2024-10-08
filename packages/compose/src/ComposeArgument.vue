<docs>
Provides the means to review and edit a PROformajs argument's attributes and children

# props

* protocol - a PROformajs Protocol
* path - the path to the component of interest

# events

* change-protocol - indicates need to update the protocol,
</docs>

<template>
  <div>
    <h4>Argument: {{ argument.idx }}</h4>
    <div class="mb-2">
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm me-1"
        @click="$emit('select-path', { value: '' })"
      >
        &lt;&lt; Candidate: {{ parentName }}
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm me-1"
        v-if="numSiblings > 1"
        :disabled="argument.idx == 0"
        @click="prevArg"
      >
        &lt; Prev
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        v-if="numSiblings > 1"
        :disabled="argument.idx == numSiblings - 1"
        @click="nextArg"
      >
        Next &gt;
      </button>
    </div>
  </div>
</template>

<script>
import ComposeInput from './ComposeInput.vue'
import ComposeCondition from './ComposeCondition.vue'
import ComposeTextArea from './ComposeTextArea.vue'

export default {
  props: {
    protocol: Object,
    path: String,
    issues: Array
  },
  emits: ['select-path', 'change-protocol'],
  components: {
  },
  data() {
    return {
      tabIndex: 0
    }
  },
  computed: {
    argument() {
      let component
      try {
        component = this.protocol.getComponent(this.path)
      } catch (e) {
        component = this.protocol
      }
      return component
    },
    magnitude() {
      return Math.abs(this.argument.support)
    },
    supportSymbol: {
      get: function () {
        if (this.argument.support == -Infinity) {
          return '--'
        } else if (this.argument.support < 0) {
          return '-'
        } else if (this.argument.support == Infinity) {
          return '++'
        } else {
          return '+'
        }
      },
      set: function (value) {
        if (value === '--') {
          this.updateAttribute({ name: 'support', value: -Infinity })
        } else if (value === '-') {
          if (this.argument.support == Infinity || this.argument.support == -Infinity) {
            this.updateAttribute({ name: 'support', value: -999 })
          } else {
            this.updateAttribute({ name: 'support', value: -1 * this.magnitude })
          }
        } else if (value == '++') {
          this.updateAttribute({ name: 'support', value: Infinity })
        } else {
          if (this.argument.support == Infinity || this.argument.support == -Infinity) {
            this.updateAttribute({ name: 'support', value: 999 })
          } else {
            this.updateAttribute({ name: 'support', value: this.magnitude })
          }
        }
      }
    },
    activeConditionExample() {
      return 'e.g. "age > 40 && sbp > 120"'
    },
    parentName() {
      return this.argument._parent ? this.argument._parent.name : ''
    },
    numSiblings() {
      return this.argument._parent ? this.argument._parent.arguments.length : -1
    }
  },
  methods: {
    updateAttribute(evt) {
      // There is no setComponent method in a PROformajs protocol so we focus on attributes instead
      let comp = this.protocol.getComponent(this.path)
      comp[evt.name] = evt.value
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-argument' })
    },
    reset() {
      this.tabIndex = 0 // show Details tab
    },
    attributeIssues(att) {
      return this.issues.filter((issue) => issue.attribute == att)
    },
    prevArg() {
      let prevPath = this.argument._parent.arguments[this.argument.idx - 1].path()
      this.$emit('select-path', { value: prevPath })
    },
    nextArg() {
      let nextPath = this.argument._parent.arguments[this.argument.idx + 1].path()
      this.$emit('select-path', { value: nextPath })
    }
  },
  watch: {
    path: function () {
      this.reset() // if the path changes, reset the dialogues
    }
  }
}
</script>
