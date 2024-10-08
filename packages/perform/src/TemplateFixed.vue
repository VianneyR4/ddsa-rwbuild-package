<docs>
Provides a UI for a single task  in a proformajs Enactment.  Developed for TemplateCustom.
If the single task is a plan, it presents a tabbed view of that plan.

# props

* enactment - a PROformajs enactment
* options - review settings
* debug - allows access to the "Debug expressions" functionality
* taskpath - the path of the task to be shown

# events

* change-enactment - signals the need to update the enactment
* change-option - signals an option change
</docs>

<template>
  <div v-if="indicatedTask">
    <div v-if="isPlan" class="card">
      <!-- !status.finished -->
      <p-tabbed-tabs
        :plan="indicatedTask"
        :selected="selectedTask.path"
        @select-task="updatePath"
      />
      <div class="card-body">
        <p-task
          :task="selectedTask"
          :enactment="enactment"
          @update-enactment="updateEnactment"
          :options="options"
          @send-trigger="sendTrigger"
        />
      </div>
    </div>
    <p-task
      v-else
      :task="indicatedTask"
      :enactment="enactment"
      @update-enactment="updateEnactment"
      :options="options"
      @send-trigger="sendTrigger"
    />
  </div>
</template>

<script>
import { EnactmentMixin } from './perform'

export default {
  name: 'p-fixed',
  mixins: [EnactmentMixin],
  props: ['taskpath'],
  components: {
  },
  computed: {
    indicatedTask() {
      return this.enactment && this.taskpath ? this.enactment.getComponent(this.taskpath) : null
    },
    isPlan() {
      return this.indicatedTask.class === 'Plan'
    }
  }
}
</script>
