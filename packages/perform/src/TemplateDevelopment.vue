<docs>
Provides a UI for a proformajs Enactment.

# props

* enactment - a PROformajs enactment
* options - review settings
* debug - allows access to the "Debug expressions" functionality

# events

* change-enactment - signals the need to update the enactment
* change-option - signals an option change

</docs>

<template>
  <div v-if="enactment">
    <div class="">
      <!-- Selected task detail -->
      <template v-if="!enactment.protocol.tasks"
        ><!-- settings dialogue for single decision -->
        <div class="float-end">
          <button
            @click="$emit('restart-enactment')"
            role="button"
            class="btn btn-outline-secondary d-none d-sm-inline"
          >
            <font-awesome-icon icon="redo-alt" /> Restart
          </button>
          <p-settings
            :id="'popover-reivew'"
            :options="options"
            placement="left"
            @change-option="OnUpdateOptions"
            @restart-enactment="$emit('restart-enactment')"
          />
        </div>
      </template>
      <div v-if="status.finished">
        <slot name="finished">
          <h3>All done</h3>
        </slot>
        <slot name="comments"> </slot>
      </div>
      <div v-else>
        <p-task
          :task="selectedTask"
          :enactment="enactment"
          @update-enactment="updateEnactment"
          :options="options"
          @send-trigger="sendTrigger"
        />
      </div>
    </div>


    <div class="container-fluid">
      <div class="float-end">
        <button @click="$emit('restart-enactment')" class="btn btn-outline-secondary">
          <font-awesome-icon icon="redo-alt" /> Restart
        </button>
        <p-settings
          :id="'popover-review'"
          class="ms-1"
          :options="options"
          placement="left"
          :restart="false"
          @change-option="OnUpdateOptions"
          @restart-enactment="$emit('restart-enactment')"
        />
      </div>
    </div>


  </div>
</template>

<script>
import { EnactmentMixin } from './perform'

export default {
  mixins: [EnactmentMixin],
  components: {
  },
  emits: ['change-option'],
  data() {
    return {
      tabIndex: 0
    }
  },
  methods: {
    OnUpdateOptions(opts) {
      this.$emit('change-option', opts)
    }
  }
}
</script>

<style scoped>
.card-body {
  padding: 1.25rem;
}

.list-group-item {
  padding: 0.75rem 1.25rem;
}

p {
  margin-top: 0;
  margin-bottom: 1rem;
}
</style>
