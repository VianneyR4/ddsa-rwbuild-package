import EnactmentTask from './EnactmentTask.vue'
import EnactmentData from './EnactmentData.vue'
import EnactmentHistory from './EnactmentHistory.vue'
import EnactmentSettings from './EnactmentSettings.vue'
import EnactmentMarkdown from './EnactmentMarkdown.vue'

// A mixin that's used by multiple templates
export const EnactmentMixin = {
  props: ['enactment', 'options', 'debug'],
  data: function () {
    return {
      path: null // selected task
    }
  },
  emits: [
    'change-enactment',
    'restart-enactment',
    'change-option',
    'change-active-task',
    'change-selected-task'
  ],
  components: {
    'p-task': EnactmentTask,
    'p-data': EnactmentData,
    'p-history': EnactmentHistory,
    'p-settings': EnactmentSettings,
    'p-markdown': EnactmentMarkdown
  },
  computed: {
    availableTasks() {
      const order = (task) => {
        return task.meta && task.meta.ui && Object.keys(task.meta.ui).includes('order')
          ? task.meta.ui.order
          : 0
      }
      if (this.enactment) {
        const comp = (a, b) => {
          const taskA = this.enactment.getComponent(a.path)
          const taskB = this.enactment.getComponent(b.path)
          return order(taskA) - order(taskB)
        }
        return this.enactment
          .getTasks()
          .filter(function (task) {
            return task.state == 'in_progress' && (task.class != 'Plan' || !task.autonomous)
          })
          .sort(comp)
      } else {
        return []
      }
    },
    status() {
      return this.enactment ? this.enactment.getStatus() : {}
    },
    activeTask() {
      return this.selectedTask && this.selectedTask.status === 'in_progress'
        ? this.selectedTask
        : this.availableTasks[0]
    },
    selectedTask() {
      return this.path && this.enactment ? this.enactment.getComponent(this.path) : null
    }
  },
  methods: {
    updateEnactment(evt) {
      let enactment = this.enactment
      let result = { action: evt.action, path: evt.path }
      let update = {}
      switch (evt.action) {
        case 'complete':
          enactment.complete(evt.path)
          break
        case 'set':
          update[evt.source] = evt.value
          enactment.set(evt.path, update)
          result.source = { name: evt.source, value: evt.value }
          break
        case 'unset':
          enactment.unset(evt.path, evt.source)
          result.source = evt.source
          break
        case 'confirm':
          enactment.confirm(evt.path)
          break
        case 'unconfirm':
          enactment.unconfirm(evt.path)
          break
      }
      result.value = enactment
      this.$emit('change-enactment', result)
    },
    accordianId(value) {
      return 'accordian' + value
    },
    getValues() {
      let data = this.enactment.getData()
      let result = []
      for (let path in data) {
        for (let key in data[path]) {
          if (data[path][key] != null) {
            result.push({ key: key, value: data[path][key] })
          }
        }
      }
      return result
    },
    updatePath(evt) {
      this.path = evt.value
    },
    updateSource(evt) {
      evt.path = this.enactment.protocol.name // assumes a particular shape of protocol
      this.updateEnactment(evt)
    },
    sendTrigger(trigger) {
      let enactment = this.enactment
      enactment.sendTrigger(trigger)
      this.$emit('change-enactment', { value: enactment, action: 'trigger', trigger: trigger })
    }
  },
  watch: {
    enactment: function (val) {
      if (val) {
        let status = val.getStatus()
        let audit = val._audit
        if (audit.length > 0) {
          let actions = Object.keys(audit[audit.length - 1].action)
          let tasks = this.availableTasks
          if (!status.finished && (actions.includes('complete') || actions.includes('trigger'))) {
            // after a trigger is sent or a task completed, we need to select a new task
            if (tasks.length > 0) {
              this.path = tasks[0].path
            } else {
              this.path = null
            }
          } else {
            let taskpaths = tasks.map(function (task) {
              return task.path
            })
            if (!taskpaths.includes(this.path)) {
              // handle an unexpected change of enactment
              if (this.availableTasks.length > 0) {
                this.path = this.availableTasks[0].path
              } else {
                this.path = null
              }
            }
          }
        }
      }
    },
    activeTask: {
      handler(val) {
        if (!this.path) {
          this.path = val ? val.path : null
        }
        this.$emit('change-active-task', val)
      },
      immediate: true
    },
    selectedTask: {
      handler(val) {
        this.$emit('change-selected-task', val)
      },
      immediate: true
    }
  }
}
