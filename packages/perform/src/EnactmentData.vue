<docs>
Provides access to all the enactment data with a block of badges,
one for each data definition.  Each dd can be selected and updated by clicking
the badge and then updating the associated form field.  data definitions with
values are highlighted and shown with their value.

# props

* enactment - a PROformajs enactment
* options - for passing expression debug flags

# events

* update-enactment is emitted when a data definition is updated
</docs>

<template>
  <div>
    <template v-if="enactment && enactment.getDataDefinitions().length > 0">
      <div class="card mt-2" v-if="selected">
        <div class="card-body">
          <p-source
            v-if="!selected.valueCondition"
            suffix="data"
            :source="selected"
            :value="value(selected)"
            @erase-source="updateSource"
            @update-source="updateSource"
          />
          <div v-else>
            <label for="name" class="col-form-label col-form-label-sm pt-0"
              >{{ selected.caption || selected.name }}
              <span class="badge rounded-pill bg-secondary"> dynamic </span>
            </label>
            <div class="text-secondary">
              <em>{{ selected.valueCondition }}</em>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-3">
        <span
          v-for="dd in enactment.getDataDefinitions()"
          :key="key(dd)"
          class="badge rounded-pill m-1 p-1 clickable"
          :class="{
            'bg-info': isSelected(dd),
            'bg-dark': !isSelected(dd) && hasValue(dd),
            'bg-light': !isSelected(dd) && !hasValue(dd),
            'text-dark': !isSelected(dd) && !hasValue(dd)
          }"
          @click="select(dd.name)"
        >
          {{ dd.name
          }}<span v-if="value(dd) != null">
            =
            {{ badgeValue(Array.isArray(value(dd)) ? '[' + value(dd) + ']' : value(dd)) }}</span
          >
        </span>
      </div>
      <hr class="mb-1" />
      <div class="float-end">
        <small>Key:</small>
        <span class="badge rounded-pill bg-light text-dark m-1">unknown</span>
        <span class="badge rounded-pill bg-dark m-1">known</span>
        <span class="badge rounded-pill bg-info m-1">selected</span>
      </div>
    </template>
    <p v-else class="text-muted">No data definitions available</p>
    <p-expression
      v-if="options.debug"
      :enactment="enactment"
      :path="enactment.protocol.name"
      description="Evaluate expression from the context of the root task"
      class="mt-2"
      id="data"
    />
  </div>
</template>

<script>
import EnactmentSource from './EnactmentSource.vue'
import EnactmentExpression from './EnactmentExpression.vue'

export default {
  props: ['enactment', 'options'],
  components: {
    'p-source': EnactmentSource,
    'p-expression': EnactmentExpression
  },
  data() {
    return {
      selectedName: null // name of selected data definition
    }
  },
  computed: {
    selected() {
      if (this.selectedName) {
        return this.enactment.getDataDefinitions().find((dd) => dd.name == this.selectedName)
      } else {
        return null
      }
    }
  },
  created() {
    if (this.enactment && this.enactment.getDataDefinitions().length > 0) {
      let dd = this.enactment.getDataDefinitions()[0]
      this.selectedName = dd.name
    }
  },
  methods: {
    key(dd) {
      return 'accordian' + dd.path.replace('[', '').replace(']', '').replace(':', '')
    },
    updateSource(evt) {
      evt.path = this.enactment.runtimeFromDesignPath(this.enactment.protocol.name)
      this.$emit('update-enactment', evt)
    },
    value(dd) {
      let path = this.enactment.runtimeFromDesignPath(this.enactment.protocol.name)
      return this.enactment.get(path, dd.name)
    },
    badgeValue(value) {
      return value
        ? value.toString().length > 12
          ? value.toString().substr(0, 12) + '...'
          : value.toString()
        : value
    },
    isSelected(dd) {
      return this.selectedName && dd.name == this.selectedName
    },
    hasValue(dd) {
      return dd.value != null
    },
    select(name) {
      this.selectedName = name
    }
  }
}
</script>
