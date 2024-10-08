<docs>
Provides a proformajs Enactment object for Template.

## props

* protocol - a PROformajs Protocol.Task object
* debug - allow access to the "Debug expressions" functionality
* template - indicate which template to use
* startData - optional initial data for the enactment

## events

* start-enactment - signals a started enactment
* update-enactment - signals that the enactment has been updated

# Notes

An obvious simplification of this component is to remove the json data item
and replace it with an enactment which, when combined with a deep watch in the
Template component seems to work well, at least initially.

The problem with this stategy is that vue's data reactivity will miss any
new data values and newly created cyclic tasks which is why its not used.
</docs>

<template>
  <component
    v-if="!exception"
    v-bind:is="'p-template-' + template"
    :enactment="enactment"
    :options="TemplateOptions"
    @change-enactment="updateEnactment"
    @restart-enactment="resetEnactment"
    @change-active-task="setActiveTask"
    @change-selected-task="setSelectedTask"
    @change-option="updateOption"
    :debug="debug"
  >
    <template v-slot:finished>
      <slot name="finished"></slot>
    </template>
  </component>
  <div v-else>
    <div class="row mt-5">
      <div class="col-6 offset-3">
        <h3 class="my-3">Exception</h3>
        <p>A runtime exception occurred</p>
        <p class="text-danger">{{ exception }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Enactment } from '@openclinical/proformajs'
import TemplateDevelopment from './TemplateDevelopment.vue'
import TemplateCompact from './TemplateCompact.vue'
import TemplateCustom from './TemplateCustom.vue'
import TemplateMobile from './TemplateMobile.vue'

export default {
  name: 'p-perform',
  props: {
    protocol: Object,
    debug: Boolean,
    template: {
      type: String,
      default: 'compact',
      validator: function (value) {
        return ['development', 'compact', 'tabbed', 'custom', 'mobile'].indexOf(value) !== -1
      }
    },
    initialData: {
      type: Object,
      required: false
    },
    comments: Object
  },
  components: {
    'p-template-development': TemplateDevelopment,
    'p-template-compact': TemplateCompact,
    'p-template-custom': TemplateCustom,
    'p-template-mobile': TemplateMobile
  },
  data: function () {
    return {
      json: null,
      TemplateOptions: {
        Decision: {
          showInactiveArguments: false,
          showExpressions: false,
          allowDownloads: false
        },
        Enquiry: {
          useDefaults: true
        },
        Candidate: {
          autoConfirmRecommended: true
        },
        debug: false
      },
      exception: null
    }
  },
  computed: {
    enactment() {
      try {
        let enactment = this.json ? Enactment.inflate(this.json) : null
        this.$emit('update-enactment', enactment)
        return enactment
      } catch (e) {
        console.log('p-perform: cannot create enactment', e.message, this.json)
        return null
      }
    },
    enactmentOptions() {
      // provides a view of TemplateOptions that are relevant to the enactment (not the Template UI)
      // this view stops enactments being updated unecessarily when a UI option changes
      return {
        Enquiry: {
          useDefaults: this.TemplateOptions.Enquiry.useDefaults
        }
      }
    }
  },
  methods: {
    updateEnactment(evt) {
      this.json = JSON.stringify(evt.value)
    },
    resetEnactment() {
      if (this.protocol && this.protocol.isValid()) {
        try {
          let local = null
          if (this.initialData && Object.keys(this.initialData).length > 0) {
            local = new Enactment({
              start: false,
              protocol: this.protocol,
              options: this.enactmentOptions
            })
            local.setData(this.initialData)
          } else {
            local = new Enactment({
              start: true,
              protocol: this.protocol,
              options: this.enactmentOptions
            })
          }
          this.json = JSON.stringify(local)
          this.exception = null
          this.$emit('start-enactment')
        } catch (e) {
          this.exception = e.message
        }
      } else {
        this.json = null
      }
    },
    updateOption(evt) {
      if (evt.category) {
        this.TemplateOptions[evt.category][evt.option] = evt.value
      } else {
        this.TemplateOptions[evt.option] = evt.value
      }
      // a change in eqnuiry options requires restarting the enactment
      if (evt.category == 'Enquiry') {
        this.resetEnactment()
      }
    },
    setActiveTask(evt) {
      this.$emit('change-active-task', evt)
    },
    setSelectedTask(evt) {
      this.$emit('change-selected-task', evt)
    }
  },
  created: function () {
    this.resetEnactment()
  },
  watch: {
    protocol: {
      // https://stackoverflow.com/questions/44584078/vuejs-2-0-cant-hook-a-component-on-props-update
      deep: true, // without this flag changes only percolate when the protocol is saved
      handler() {
        // val, oldval
        this.resetEnactment()
      }
    }
  }
}
</script>
