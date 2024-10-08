<docs>
Provides the means to review and edit a PROformajs candidates's attributes and children

# props

* protocol - a PROformajs Protocol
* path - the path to the component of interest- the path to the component of interest

# events

* change-protocol - indicates need to update the protocol,e-protocol - indicates need to update the protocol,
</docs>

<template>
  <div>
    <c-argument
      v-if="argumentPath != ''"
      :protocol="protocol"
      :path="argumentPath"
      @change-protocol="$emit('change-protocol', $event)"
      @select-path="updateArgumentPath"
      ref="argumentEditor"
      :issues="subComponentIssues(argumentPath)"
    />
    <div :class="argumentPath == '' ? 'd-block' : 'd-none'">
      <h4>Candidate: {{ candidate.name }}</h4>
      <div class="mb-2">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm me-1"
          @click="$emit('select-path', { value: '' })"
        >
          &lt;&lt; Decision: {{ parentName }}
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm me-1"
          v-if="numSiblings > 1"
          :disabled="candIdx == 0"
          @click="prevCand"
        >
          &lt; Prev
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          size="sm"
          v-if="numSiblings > 1"
          :disabled="candIdx == numSiblings - 1"
          @click="nextCand"
        >
          Next &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Protocol } from '@openclinical/proformajs'

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
      argumentPath: '',
      threshold: false,
      thresholdValue: 0,
      tabIndex: 0
    }
  },
  computed: {
    candidate() {
      let component
      try {
        component = this.protocol.getComponent(this.path)
      } catch (e) {
        component = this.protocol
      }
      return component
    },
    example() {
      return 'e.g. "net_support(\'' + this.candidate.name + '\')>0"'
    },
    parentName() {
      return this.candidate._parent ? this.candidate._parent.name : ''
    },
    candIdx() {
      return this.candidate._parent ? this.candidate._parent.candidates.indexOf(this.candidate) : -1
    },
    numSiblings() {
      return this.candidate._parent ? this.candidate._parent.candidates.length : -1
    }
  },
  methods: {
    updateAttribute(evt) {
      // There is no setComponent method in a PROformajs protocol so we focus on attributes instead
      let comp = this.protocol.getComponent(this.path)
      comp[evt.name] = evt.value
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-candidate.0' })
      // changing the name will change the path, so the path needs updating
      if (evt.name == 'name') {
        this.$emit('select-path', { value: comp.path() })
      }
    },
    updateArgumentPath(evt) {
      this.argumentPath = evt.value
      this.tabIndex = 1 // show Arguments tab
    },
    selectArgument(idx) {
      let argument = this.candidate.arguments[idx]
      this.argumentPath = argument.path()
    },
    addArgument(evt) {
      let arg = new Protocol.Argument({
        caption: evt.target.value,
        support: '+',
        activeCondition: evt.target.value
      })
      this.candidate.addArgument(arg)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-candidate.1' })
      evt.target.value = ''
    },
    deleteArgument(idx) {
      this.candidate.arguments.splice(idx, 1)
      // adjust the idx attributes accordingly
      for (let i = idx; i < this.candidate.arguments.length; i++) {
        this.candidate.arguments[i].idx = this.candidate.arguments[i].idx - 1
      }
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-candidate.2' })
      return false
    },
    reset() {
      this.tabIndex = 0 // show Details tab
    },
    attributeIssues(att) {
      return this.issues.filter((issue) => issue.attribute == att)
    },
    subComponentIssues(comp) {
      return this.issues.filter((issue) => issue.path.startsWith(comp))
    },
    prevCand() {
      let prevPath = this.candidate._parent.candidates[this.candIdx - 1].path()
      this.$emit('select-path', { value: prevPath })
    },
    nextCand() {
      let nextPath = this.candidate._parent.candidates[this.candIdx + 1].path()
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

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
