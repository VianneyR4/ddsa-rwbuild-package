<docs>
Provides a custom UI for a proformajs Enactment. Looks to the root task meta to organise the UI.

status: alpha - used in the shortness of breath example

The goal is to be able to re-create the existing review UIs and create your own custom view that uses the following components:
* Fixed
* SettingsModal
* Tabs (see Fixed)
* Map (TODO)
* Data
* AvailableTaskButtons (TODO)
* AvailableTriggerButtons (TODO)
* HistoryAccordian (TODO)
* SelectedTask (TODO)
* Choice (TODO)
* ChoiceButton (TODO)
* RestartButton (TODO)

# props

* enactment - a PROformajs enactment
* options - review settings
* debug - allows access to the "Debug expressions" functionality

# events

* change-enactment - signals the need to update the enactment
* change-option - signals an option change

# meta

The shortness of breath example uses this meta:

```json
"enact": {
  "ui": {
    "cols": [
      {
        "width": 6,
        "contents": [
          {
            "component": "fixed",
            "path": "shortness_of_breath:enquiry"
          },
          {
            "component": "data"
          }
        ]
      },
      {
        "width": 6,
        "contents": [
          { "component": "settings" },
          {
            "component": "fixed",
            "path": "shortness_of_breath:diagnosis"
          }
        ]
      }
    ]
  },
  "template": "custom"
}
```
</docs>

<template>
  <div v-if="enactment">
    <div class="row">
      <div v-for="(col, colidx) of cols" :class="'col-' + col.width" :key="colidx">
        <template v-for="(comp, compidx) of col.contents" :key="compidx">
          <p-fixed
            v-if="comp.component == 'fixed'"
            :enactment="enactment"
            :options="options"
            :debug="debug"
            :taskpath="comp.path"
            @change-enactment="$emit('change-enactment', $event)"
          />
          <p-settings
            :id="'popover-review-custom'"
            class="float-end"
            v-if="comp.component == 'settings'"
            :options="options"
            @restart-enactment="$emit('restart-enactment')"
            @change-option="$emit('change-option', $event)"
          />
          <div v-if="comp.component == 'data'">
            <h3>All data</h3>
            <p-data :enactment="enactment" :options="options" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { EnactmentMixin } from './perform'
import TemplateFixed from './TemplateFixed.vue'

export default {
  mixins: [EnactmentMixin],
  components: {
    'p-fixed': TemplateFixed
  },
  computed: {
    cols() {
      let meta = this.enactment.protocol.meta
      return meta && meta.enact && meta.enact.ui && meta.enact.ui.cols ? meta.enact.ui.cols : []
    }
  }
}
</script>
