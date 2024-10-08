<docs>
Provides the means to review and edit a PROformajs task's attributes and children

# props

* protocol - a PROformajs Protocol
* path - the path to the task of interest

# events

* change-protocol - indicates need to update the protocol, optionally with an update to the selectedtask path
* delete-task - indicates desire to delete this task
</docs>

<template>
  <div>
    <c-data
      v-if="dataDefinitionPath"
      :protocol="protocol"
      :path="dataDefinitionPath"
      :issues="subComponentIssues(dataDefinitionPath)"
      @change-protocol="relayChangeEvent($event, 0)"
      @select-path="updateDataDefinitionPath"
      ref="dataDefinitionEditor"
    />
    <c-source
      v-if="sourcePath"
      :protocol="protocol"
      :path="sourcePath"
      @change-protocol="relayChangeEvent($event, 1)"
      @select-path="updateSourcePath"
      ref="sourceEditor"
    />
    <c-candidate
      v-if="candidatePath"
      :protocol="protocol"
      :path="candidatePath"
      @change-protocol="relayChangeEvent($event, 2)"
      @select-path="updateCandidatePath"
      ref="candidateEditor"
      :issues="subComponentIssues(candidatePath)"
    />
    <div v-show="!dataDefinitionPath && !sourcePath && !candidatePath">
      <h4> {{ task.name }}</h4>
    </div>
  </div>
</template>

<script>
import { Protocol } from '@openclinical/proformajs'
import ComposeData from './ComposeData.vue'
import ComposeSource from './ComposeSource.vue'
import ComposeCandidate from './ComposeCandidate.vue'

export default {
  name: 'c-task',
  props: {
    protocol: Object,
    path: String, // path of the selected component,
    issues: Array
  },
  emits: ['change-protocol', 'select-task', 'delete-task'],
  components: {
    'c-data': ComposeData,
    'c-source': ComposeSource,
    'c-candidate': ComposeCandidate,
  },
  data() {
    return {
      tabIndex: 0,
      dataDefinitionPath: '',
      sourcePath: '',
      candidatePath: '',
      dataDefinitionsFilter: '',
      isValid: true,
      lastInputName: null,
      feedback: ''
    }
  },
  computed: {
    task() {
      let component
      try {
        component = this.protocol.getComponent(this.path)
      } catch (e) {
        component = this.protocol
      }
      return component
    },
    autoCycling() {
      if (this.task) {
        // identifies tasks that could cycle infinitely
        let clazz = this.task.constructor.name
        if (clazz == 'Plan') {
          // a plan with no manual tasks
          return (
            this.task.tasks.filter((subtask) => !subtask.optional && !subtask.autonomous).length ==
            0
          )
        } else {
          return true // an Enquiry, Decision or Task could auto cycle
        }
      } else {
        return false
      }
    },
    disableCyclic() {
      // an autocycling task that is autonomous and cyclic will cycle indefinately - this check should prevent this state, see disableAutonomous
      return this.autoCycling && this.task.autonomous
    },
    disableAutonomous() {
      // an autoCycling task that is autonomous and cyclic will cycle indefinately - this check should prevent this state, see disableCyclic
      return this.autoCycling && this.task.cyclic
    },
    iconPath() {
      return '/icons/' + this.task.constructor.name + '.svg'
    },
    dataDefinitions() {
      if (this.task) {
        if (this.dataDefinitionsFilter) {
          return this.task.dataDefinitions.filter((dd) =>
            dd.name.includes(this.dataDefinitionsFilter)
          )
        } else {
          return this.task.dataDefinitions
        }
      } else {
        return null
      }
    }
  },
  methods: {
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
    localPath(issue) {
      return issue.path ? issue.path.replace(this.path + ':', '') : ''
    },
    updateAttribute(evt) {
      // There is no setComponent method in a PROformajs protocol so we focus on attributes instead
      // Check if there is a task name duplication
      if (evt.name == 'name' && this.protocol && this.protocol.tasks) {
        for (var i = 0; i < this.protocol.tasks.length; i++) {
          if (this.protocol.tasks[i].name === evt.value && this.task.name != evt.value) {
            this.feedback = 'Task name must be unique'
            this.isValid = false
            this.lastInputName = evt.value
            return
          }
        }
      }
      this.lastInputName = null
      this.isValid = true
      this.feedback = ''
      let comp = this.protocol.getComponent(this.path)
      if (evt.name == 'name') {
        // update temporal constraints of tasks that depend on this one
        if (evt.value != null && evt.value.length > 0) {
          for (let depname of this.getForwardDeps(comp)) {
            let dep = this.protocol.getComponent(comp._parent.path() + ':' + depname)
            dep.waitCondition = dep.waitCondition.replace(comp.name, evt.value)
            dep.preCondition = dep.preCondition.replace(comp.name, evt.value)
          }
        }
      }
      let newevt = { value: this.protocol }
      if (evt.value == null || evt.value.length == 0) {
        comp[evt.name] = null
      } else {
        comp[evt.name] = evt.value
      }
      if (evt.name == 'name') {
        // changing the name will change the path, so the selectedtask path needs updating
        newevt.selected = comp.path()
      }
      newevt.emitter = 'c-task.0'
      this.$emit('change-protocol', newevt)
    },
    handleDDText(evt) {
      // three states for processing input text (evt.target.value):
      // 1. the text partially matches several dds -> reduce the list of dds to matches
      // 2. the text exactly matches one dd -> go to the details of this one (and clear input box)
      // 3. the test doesnt match any dd -> create a new one and add it to the list (and clear input box)
      if (this.dataDefinitions.length > 0) {
        if (this.dataDefinitions.length == 1) {
          this.dataDefinitionPath = this.dataDefinitions[0].path()
          // clear filter and input text
          this.dataDefinitionsFilter = null
          evt.target.value = ''
        }
      } else {
        let def = new Protocol.Integer({
          name: evt.target.value,
          caption: evt.target.value.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
            return str.toUpperCase()
          })
        })
        this.task.addDataDefinition(def)
        this.$emit('change-protocol', { value: this.protocol, emitter: 'c-task.1' })
        this.dataDefinitionsFilter = null
        evt.target.value = ''
      }
    },
    selectDef(idx) {
      let def = this.dataDefinitions[idx]
      this.dataDefinitionPath = def.path()
    },
    updateDataDefinitionPath(evt) {
      this.dataDefinitionPath = evt.value
      this.tabIndex = 1 // show Data tab
    },
    deleteDef(idx) {
      this.task.dataDefinitions.splice(idx, 1)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-task.2' })
    },
    sourceDataDefs() {
      // return all non-dynamic data definitions
      return this.task.allDataDefinitions().filter(function (dd) {
        return !dd.valueCondition
      })
    },
    availableDataDefs() {
      // return all non-dynamic data definitions that are not already used by this enquiry
      let sources = this.task.sources
      function used(dd) {
        return sources.find(function (src) {
          return src.type == dd.name
        })
      }
      return this.sourceDataDefs().filter(function (dd) {
        return !used(dd)
      })
    },
    updateSourcePath(evt) {
      this.sourcePath = evt.value
      this.tabIndex = 1 // show Sources tab
    },
    selectSource(idx) {
      let source = this.task.sources[idx]
      this.sourcePath = source.path()
    },
    addSource() {
      let type = this.$refs.newSourceType.value
      this.task.addSource(new Protocol.Source({ type: type }))
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-task.2' })
    },
    renderCondition(src) {
      if (src.requestCondition) {
        let result = 'custom'
        let mtch = src.requestCondition.match(/!is_known\('(\w+)'\)/)
        if (mtch && mtch[1] == src.type) {
          mtch = src.requestCondition.match(
            /\|\|\s*last_updated\('(\w+)'\)\.diff\(now\(\),\s*'(minutes|hours|days|months|years)'\)>(\d+)/
          )
          if (mtch && mtch[1] == src.type) {
            result = 'from last ' + mtch[3] + ' ' + mtch[2]
          } else {
            result = 'required'
          }
        }
        return result
      } else {
        return 'optional'
      }
    },
    renderNonTemporalClauses(expr) {
      return this.getNonTemporalClauses(expr).nonTemporal
    },
    deleteSource(idx) {
      this.task.sources.splice(idx, 1)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-task.3' })
    },
    addCandidate(evt) {
      let cand = new Protocol.Candidate({
        name: evt.target.value,
        caption: evt.target.value.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
          return str.toUpperCase()
        }),
        recommendCondition: "net_support('" + evt.target.value + "')>0"
      })
      this.task.addCandidate(cand)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-task.4' })
      evt.target.value = ''
    },
    updateCandidatePath(evt) {
      this.candidatePath = evt.value
      if (this.task.candidates && this.task._parent) {
        this.tabIndex = 1 // show Candidates for decision in plan
      } else {
        this.tabIndex = 2 // for standalone decision
      }
    },
    selectCandidate(idx) {
      let candidate = this.task.candidates[idx]
      this.candidatePath = candidate.path()
    },
    deleteCandidate(idx) {
      this.task.candidates.splice(idx, 1)
      this.$emit('change-protocol', { value: this.protocol, emitter: 'c-task.1' })
      return false
    },
    undoInput() {
      this.isValid = true
      this.lastInputName = null
    },
    reset() {
      this.isValid = true
      this.lastInputName = null
      this.tabIndex = 0 // show Details tab
      // reset state of the dialogues
      this.dataDefinitionPath = '' // closes the DataDefinitionEditor if its open
      this.sourcePath = ''
      this.candidatePath = ''
      this.dataDefinitionsFilter = ''
    },
    attributeIssues(att) {
      return this.issues.filter((issue) => issue.attribute == att)
    },
    subComponentIssues(comp) {
      return this.issues.filter((issue) => issue.path.startsWith(comp))
    },
    deleteTask(evt) {
      this.$emit('delete-task', evt)
    },
    relayChangeEvent(evt, idx) {
      evt.relay = 'c-task.' + idx
      this.$emit('change-protocol', evt)
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
