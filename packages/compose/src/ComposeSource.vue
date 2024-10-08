<docs>
Provides the means to review and edit a PROformajs source details

# props

* protocol - a PROformajs Protocol
* path - the path to the component of interest

# events

* change-protocol - indicates need to update the protocol,
</docs>

<template>
  <div>
    <h4>Source: {{ source.type }}</h4>
    <div class="mb-2">
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm me-1"
        @click="$emit('select-path', { value: '' })"
      >
        &lt;&lt; {{ source._parent.constructor.name }}: {{ source._parent.name }}
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm me-1"
        v-if="numSiblings > 1"
        :disabled="sourceIdx == 0"
        @click="prevSource"
      >
        &lt; Prev
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        v-if="numSiblings > 1"
        :disabled="sourceIdx == numSiblings - 1"
        @click="nextSource"
      >
        Next &gt;
      </button>
    </div>
  </div>
</template>

<script>
// for use in RequestCondition
const cls1 = /!is_known\('(\w+)'\)/
const cls2 =
  /\|\|\s*last_updated\('(\w+)'\)\.diff\(now\(\),\s*'(minutes|hours|days|months|years)'\)>(\d+)/

class RequestCondition {
  // helper class to interpret expressions of the form
  // !is_known('name') || last_updated('name').diff(now(), 'days')>5
  // where the first clause shows the the source is required
  // and the second limits the time window in which it should have been acquired
  constructor(source) {
    this.source = source
  }
  isRequired() {
    if (this.source && this.source.requestCondition) {
      let mtch = this.source.requestCondition.match(cls1)
      return mtch && mtch[1] == this.source.type
    } else {
      return false
    }
  }
  timely() {
    if (this.source && this.source.requestCondition) {
      let mtch = this.source.requestCondition.match(cls2)
      if (mtch && mtch.length == 4 && mtch[1] == this.source.type) {
        return { unit: mtch[2], value: mtch[3] }
      } else {
        return null
      }
    } else {
      return null
    }
  }
  // true if there is an expression that doesnt match the expected form
  isCustom() {
    if (this.source && this.source.requestCondition) {
      let mtch1 = this.source.requestCondition.match(cls1)
      if (!mtch1 || (mtch1 && mtch1[1] != this.source.type)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

export default {
  props: {
    protocol: Object,
    path: String
  },
  components: {
  },
  emits: ['change-protocol', 'select-path'],
  data() {
    return {
      timeUnit: 'hours',
      timeUnits: 24,
      expressionTester: null,
      tabindex: 0
    }
  },
  computed: {
    source() {
      let component
      try {
        component = this.protocol.getComponent(this.path)
      } catch (e) {
        component = null
      }
      return component
    },
    required() {
      return this.expressionTester && this.expressionTester.isRequired()
    },
    timely() {
      let result = this.expressionTester ? this.expressionTester.timely() : null
      return result
    },
    custom() {
      return this.expressionTester != null && this.expressionTester.isCustom()
    },
    sourceIdx() {
      return this.source._parent ? this.source._parent.sources.indexOf(this.source) : -1
    },
    numSiblings() {
      return this.source._parent ? this.source._parent.sources.length : -1
    }
  },
  methods: {
    setRequired(evt) {
      this.source.requestCondition = this.requestCondition(evt.target.checked, null)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-source.0' })
    },
    setTimely(evt) {
      this.source.requestCondition = this.requestCondition(true, evt.target.checked)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-source.1' })
    },
    setRequestCondition() {
      this.source.requestCondition = this.requestCondition(true, true)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-source.2' })
    },
    requestCondition(required, timely) {
      if (required) {
        let result = "!is_known('" + this.source.type + "')"
        if (timely) {
          result =
            result +
            " || last_updated('" +
            this.source.type +
            "').diff(now(), '" +
            this.timeUnit +
            "')>" +
            this.timeUnits.toString()
        }
        return result
      } else {
        return null
      }
    },
    reset() {
      this.timeUnits = 24
      this.timeUnit = 'hours'
      this.expressionTester = new RequestCondition(this.source)
    },
    prevSource() {
      let prevPath = this.source._parent.sources[this.sourceIdx - 1].path()
      this.$emit('select-path', { value: prevPath })
    },
    nextSource() {
      let nextPath = this.source._parent.sources[this.sourceIdx + 1].path()
      this.$emit('select-path', { value: nextPath })
    }
  },
  watch: {
    path: function () {
      this.reset() // if the path changes, reset the dialogues
    },
    source: {
      immediate: true,
      handler: function (newSource) {
        this.expressionTester = new RequestCondition(newSource)
      }
    },
    expressionTester: {
      immediate: true,
      handler: function (newTester) {
        let result = newTester ? newTester.timely() : null
        if (result) {
          this.timeUnit = result.unit
          this.timeUnits = result.value
        }
      }
    }
  }
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
