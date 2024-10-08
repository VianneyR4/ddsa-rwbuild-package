<docs>
Provides the means to review and edit a PROformajs data definition's attributes and children

# props

* protocol - a PROformajs Protocol
* path - the path to the component of interest

# events

* change-protocol - indicates need to update the protocol,
</docs>

<template>
  <div>
    <h4>Data Definition: {{ def.name }}</h4>
    <div class="mb-2">
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm me-1"
        @click="$emit('select-path', { value: '' })"
      >
        &lt;&lt; {{ def._parent.constructor.name }}: {{ def._parent.name }}
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm me-1"
        size="sm"
        v-if="numSiblings > 1"
        :disabled="defIdx == 0"
        @click="prevDef"
      >
        &lt; Prev
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary btn-sm"
        size="sm"
        v-if="numSiblings > 1"
        :disabled="defIdx == numSiblings - 1"
        @click="nextDef"
      >
        Next &gt;
      </button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
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
      isValid: true,
      feedback: '',
      tabIndex: 0,
      rangeAnnotatedToggle: false,
      rangeEditIdx: -1,
      editingValue: ''
    }
  },
  updated() {
    if (this.$refs.editrangevalue?.length && this.$refs.editrangevalue?.length > 0) {
      this.$refs.editrangevalue[0].focus()
    }
  },
  computed: {
    def() {
      let component
      try {
        // an enquiry that defines a data definition and uses it for a source has
        // ambiguous paths so we cant just call getComponent(this.path) here
        let comps = this.path.split(':')
        let name = comps.pop()
        let parentPath = comps.join(':')
        let parentComponent = this.protocol.getComponent(parentPath)
        for (let child of parentComponent.dataDefinitions) {
          if (child.name == name) {
            component = child
          }
        }
      } catch (e) {
        // this will happen if the name of the component is changed elsewhere, i.e. in the code editor
        component = this.protocol // fall back to a safe component
        this.$emit('select-path', { value: '' }) // but get out of this editor
      }
      return component
    },
    clazz: {
      get: function () {
        return this.def.constructor.name
      },
      set: function (evt) {
        // Note that changing the class of a data definition may generate validation errors if it already has range values
        let newdef = new Protocol[evt](this.def)
        this.def._parent.dataDefinitions[this.defIdx] = newdef
        this.$emit('change-protocol', { value: this.protocol, emitter: 'c-data.0' })
      }
    },
    defIdx() {
      return this.def._parent ? this.def._parent.dataDefinitions.indexOf(this.def) : -1
    },
    numSiblings() {
      return this.def._parent ? this.def._parent.dataDefinitions.length : -1
    },
    valueConditionExample() {
      return "e.g. \"is_known('dob') ? now().diff(dob, 'years') : undefined\""
    },
    rangeAnnotated() {
      return this.def.range && this.def.range.length > 0
        ? this.def.range[0].caption != null
        : this.rangeAnnotatedToggle
    }
  },
  methods: {
    updateAttribute(evt) {
      // There is no setComponent method in a PROformajs protocol so we focus on attributes instead
      let comp = this.protocol.getComponent(this.path)
      if (evt.value == null) {
        comp[evt.name] = null
      } else {
        comp[evt.name] = evt.value
      }
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-data.1' })
      // changing the name will change the path, so the path needs updating
      if (evt.name == 'name') {
        this.$emit('select-path', { value: comp.path() })
      }
    },
    getValue(text) {
      let val
      if (text == '') {
        if (this.rangeEditIdx != -1) {
          this.isValid = false
          this.feedback = 'Value must not be empty'
        } else {
          this.isValid = true
        }
        return null
      }
      switch (this.clazz) {
        case 'Integer':
          val = parseInt(text)
          if (!isNaN(val) && isFinite(val)) {
            this.isValid = true
            return val
          } else {
            this.isValid = false
            this.feedback = 'Must be a whole number'
            return null
          }
        case 'Float':
          val = parseFloat(text)
          if (!isNaN(val) && isFinite(val)) {
            this.isValid = true
            return val
          } else {
            this.isValid = false
            this.feedback = 'Must be a number'
            return null
          }
        case 'Date':
          val = new moment(text, 'DD/MM/YYYY', true)
          if (val.isValid()) {
            this.isValid = true
            return text
          } else {
            this.isValid = false
            this.feedback = 'A date must be of the form dd/mm/yyyy'
            return null
          }
        case 'Boolean':
          return text == 'true' || text == true
        case 'Text':
          return text
        default:
          console.log('unknown class', this.source)
          return text
      }
    },
    showValue(val) {
      return this.isValid ? val : this.editingValue
    },
    addRangeItem() {
      this.editingValue = this.$refs.rangeValue.value.trim()
      if (!this.def.range) {
        this.def['range'] = []
      }
      const valueGet = this.getValue(this.$refs.rangeValue.value.trim())
      if (valueGet != null) {
        this.editingValue = ''
        if (this.rangeAnnotated) {
          this.def.range[this.def.range.length] = {
            value: valueGet,
            caption: this.$refs.rangeCaption.value.trim()
          }
          this.$refs.rangeCaption.value = null
        } else {
          this.def.range[this.def.range.length] = valueGet
        }
        this.$refs.rangeValue.value = null
        this.$refs.rangeValue.focus()
        this.$emit('change-protocol', { value: this.protocol, emitter: 'c-data.2' })
      }
    },
    editRangeItem(idx, evt) {
      var valueGet = null
      if (this.rangeAnnotated) {
        // note strongly coupled to html structure above
        // because I was unable to use $refs as in addRangeItem,
        // perhaps because the ref'd element is dynamic
        let tr = evt.target
        // you might click the button which is a grandchild
        // *or* the icon which is at least a great-grandchild element
        // so we just keep going till we find the tr element
        while (tr && tr.nodeName.toLowerCase() != 'tr') {
          tr = tr.parentNode
        }
        if (tr) {
          this.editingValue = tr.children[0].children[0].value
          valueGet = this.getValue(tr.children[0].children[0].value)
          if (this.clazz == 'Boolean' || valueGet) {
            this.def.range[idx].value = valueGet // td[0].input
            this.def.range[idx].caption = tr.children[1].children[0].value // td[1].input
          }
        }
      } else {
        this.editingValue = evt.target.value
        valueGet = this.getValue(evt.target.value)
        if (this.clazz == 'Boolean' || valueGet) {
          this.def.range[idx] = valueGet
        }
      }
      if (valueGet != null) {
        this.editingValue = ''
        this.$emit('change-protocol', { value: this.protocol, emitter: 'c-data.3' })
        this.rangeEditIdx = -1
      }
    },
    deleteRangeItem(idx) {
      this.editingValue = ''
      this.def.range.splice(idx, 1)
      if (this.def.range.length == 0) {
        delete this.def['range']
      }
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-data.4' })
    },
    onInputBlur() {
      if (this.isValid) this.rangeEditIdx = -1
    },
    undoInput() {
      this.rangeEditIdx = -1
      this.isValid = true
      this.editingValue = ''
    },
    onRangeTypeChecked(rangeVal) {
      this.editingValue = ''
      this.rangeAnnotatedToggle = rangeVal
    },
    defRangeLength() {
      return this.def.range ? this.def.range.length : 0
    },
    reset() {
      this.rangeAnnotatedToggle =
        this.def.range && this.def.range.length > 0 ? this.def.range[0].caption != null : false // default to raw range setting
      this.rangeEditIdx = -1 // undo any range value editing
      this.tabIndex = 0 // show Details tab
    },
    attributeIssues(att) {
      return this.issues.filter((issue) => issue.attribute == att)
    },
    prevDef() {
      let prevPath = this.def._parent.dataDefinitions[this.defIdx - 1].path()
      this.$emit('select-path', { value: prevPath })
    },
    nextDef() {
      let nextPath = this.def._parent.dataDefinitions[this.defIdx + 1].path()
      this.$emit('select-path', { value: nextPath })
    }
  },
  watch: {
    path: function () {
      this.reset() // if the path changes, reset the dialogues
    },
    rangeEditIdx(newVal, oldVal) {
      if (newVal == oldVal) return
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
