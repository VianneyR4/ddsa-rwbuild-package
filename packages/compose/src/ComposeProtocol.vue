<docs>
Provides a bootstrap tabs element that contains
* an svg protocol map editor
* a protocol component editor
* a view of the underlying json code
that can be used to edit a PROformajs protocol:

# props

* protocol - a PROformajs protocol
* selectedtask - path of the currently selected task

# events

* change-protocol - signal change to protocol, pass updated protocol in event
* select-task - signal selected task has changed, pass new path in event
</docs>

<template>
  <div @input="focusAce">
  </div>
</template>

<script>
import { Protocol } from '@openclinical/proformajs'
import { matchingHeads } from './path'

export default {
  name: 'c-compose',
  emits: ['change-protocol', 'select-task'],
  props: ['protocol', 'selectedtask'],
  components: {
  },
  data: function () {
    return {
      jsonValid: true,
      modal: undefined,
      tabIndex: 0
    }
  },
  computed: {
    allIssues() {
      return this.jsonValid ? this.protocol.validate() : []
    },
    selectedTaskIssues() {
      if (this.jsonValid) {
        let issues = this.protocol
          .validate()
          .filter((issue) => matchingHeads(issue.path.split(':'), this.selectedtask.split(':')))
        return issues
      } else {
        return []
      }
    },
    protocolValid() {
      return this.protocol.isValid()
    }
  },
  methods: {
    focusAce(evt) {
      // when the code tab is hidden the ace editor doesnt update (which is good)
      // but I find I need to force focus when it is revealed...
      if (evt == 1) {
        // index of code tab
        this.$refs.code.focusSelected()
      }
    },
    selectTask(path) {
      function parentTask(comp) {
        if (comp instanceof Protocol.Task) {
          return comp
        } else {
          if (comp._parent) {
            return parentTask(comp._parent)
          }
        }
      }
      const task = parentTask(this.protocol.getComponent(path)).path()
      this.$emit('select-task', { value: task })
    },
    deleteTask() {
      let selected = this.protocol.getComponent(this.selectedtask)
      let plan = selected._parent
      // remove downstream dependencies
      for (let task of plan.tasks) {
        if (task.name != selected.name) {
          let deps = this.getTemporalDeps(task)
          if (deps.indexOf(selected.name) > -1) {
            this.removeAntecedent(selected._parent.path(), selected.name, task.name)
          }
        }
      }
      // remove upstream dependencies
      for (let dep of this.getTemporalDeps(selected)) {
        this.removeAntecedent(selected._parent.path(), dep, selected.name)
      }
      // delete task
      plan.tasks.splice(plan.tasks.indexOf(selected), 1)
      this.$refs.deleteTaskModal.hide()
      this.$emit('select-task', { value: plan.path() })
      this.$emit('change-protocol', { value: this.protocol, emitter: 'p-compose.0' })
    },
    relayChangeEvent(evt, idx) {
      evt.relay = 'p-compose.' + idx
      this.$emit('change-protocol', evt)
    }
  }
}
</script>
