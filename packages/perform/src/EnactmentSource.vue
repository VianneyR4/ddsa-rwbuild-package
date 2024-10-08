<docs>
Draws a source input, providing UI for user data entry to enactment state.

# props

* source
* disabled
* value
* suffix

# events

* update-source
* erase-source

# notes

Just about works.  Current coverage shown below.

| class    | single | single (ranged) | multi | multi (ranged) |
|----------|--------|-----------------|-------|----------------|
| Integer  |    Y   |         Y       |   Y   |        Y       |
| Text     |    Y   |         Y       |   Y   |        Y       |
| Float    |    Y   |         Y       |   Y   |        Y       |
| Boolean  |    Y   |         Y       |   N   |        N       |
| Date     |    Y   |         N       |   N   |        N       |

* Would be good to be simplified, which may be necessary in order to provide data updating functionality elsewhere
* value included as prop because of reactivity woes but it shouldnt be necessary.
* Boolean data items lookout for the the sources.useButtons metaprop from the parent task
* Text data items with a range lookout for a source.useDatalist metaprop
</docs>

<template>
  <div>
    <fieldset :disabled="disabled">
      <label :for="source.name + suffix" class="d-block form-label">
        <span v-if="!hideCaption || !source.description">{{ source.caption || source.name }}</span>

        <!-- If showDescriptionInline && source.description-->
        <template v-if="!showDescriptionInline && source.description">
          <t-popover-button class="p-0 ps-2">
            <div :id="'target:source' + source.path">
              <p-markdown
                :text="source.description"
                @send-trigger="$emit('send-trigger', $event)"
                class="markdown"
              />
            </div>
          </t-popover-button>
        </template>

        <!-- If source.requested && (!hideCaption || !source.description) -->
        <font-awesome-icon
          v-if="source.requested && !hideRequested && (!hideCaption || !source.description)"
          icon="asterisk"
          class="text-secondary align-top ps-2 pt-1"
        />

        <span v-if="useSliders && isNumeric && value"
          >:
          <span class="fw-bold">{{ value }}</span>
        </span>

        <!-- v-show="value != null && !hideEraser" -->
        <button
          class="btn btn-link btn-sm float-end py-0 opacity-75"
          v-show="value != null && !hideEraser"
          @click.stop="unsetSource"
        >
          <font-awesome-icon icon="eraser" />
        </button>

        <!-- If showDescriptionInline && source.description -->
        <template v-if="showDescriptionInline && source.description">
          <p-markdown
            :text="source.description"
            @send-trigger="$emit('send-trigger', $event)"
            class="text-muted markdown"
            :requested="hideCaption && source.description && source.requested"
          />
        </template>
      </label>
      <!-- End of Label -->

      <!-- If source.class == 'Boolean' -->
      <template v-if="clazz == 'Boolean'">
        <div v-if="useButtons" class="row">
          <div
            v-for="(item, idx) in source.range || [true, false]"
            :key="idx"
            class="col d-grid gap-0"
          >
            <button
              class="btn btn-outline-dark btn-sm"
              :aria-pressed="value != null && value == rangeValue(item)"
              @click="updateValue(rangeValue(item).toString())"
              data-bs-toggle="button"
              :class="{ active: value != null && value == rangeValue(item) }"
            >
              {{ booleanSourceRangeText(item) }}
            </button>
          </div>
        </div>
        <div
          v-else
          v-for="(item, idx) in source.range || [true, false]"
          :key="idx"
          class="form-check"
        >
          <input
            class="form-check-input"
            type="radio"
            :id="rangeId(item)"
            :value="rangeValue(item).toString()"
            :checked="value != null && value == rangeValue(item)"
            @change="handleRadioChange"
          />
          <label class="form-check-label" :for="rangeId(item)">{{
            booleanSourceRangeText(item)
          }}</label>
        </div>
      </template>
      <!-- Else -->
      <template v-else>
        <!-- single un-ranged -->
        <div class="input-group" v-if="!source.multiValued && !source.range">
          <template v-if="useSliders && isNumeric">
            <input
              type="range"
              class="form-range"
              :value="inputValue(value)"
              @change="handleBlur"
              @input="handleBlur"
              :min="rangemin"
              :max="rangemax"
            />
            <div class="col">
              <span class="text-body-secondary">{{ rangemin || 0 }}</span>
              <span class="float-end text-body-secondary">{{ rangemax || 100 }}</span>
            </div>
          </template>
          <template v-else>
            <input
              :name="source.name + suffix"
              class="form-control"
              type="text"
              :value="inputValue(value)"
              :placeholder="placeholder"
              @blur="handleBlur"
              @keyup.enter.prevent="handleBlur"
              @keyup.esc="clearInput"
            />
            <div class="input-group-text" v-if="clazz == 'Date'">
              <slot name="append">
                <font-awesome-icon icon="calendar-alt" />
              </slot>
            </div>
          </template>
        </div>
        <!-- single range -->
        <template v-if="!source.multiValued && source.range">
          <div class="d-grid gap-2" v-if="useButtons">
            <button
              class="btn btn-outline-dark btn-sm"
              v-for="(item, idx) in source.range"
              :key="idx"
              :aria-pressed="value == rangeValue(item)"
              @click="updateValue(rangeValue(item).toString())"
              :class="{ active: value == rangeValue(item) }"
            >
              {{ rangeText(item) }}
            </button>
          </div>
          <template v-else>
            <template v-if="useDatalist">
              <input
                :list="source.name + suffix + 'datalist'"
                :name="source.name + suffix"
                class="form-control"
                type="text"
                :value="inputValue(value)"
                :placeholder="placeholder"
                @blur="handleBlur"
                @keyup.enter.prevent="handleBlur"
                @keyup.esc="clearInput"
              />
              <datalist :id="source.name + suffix + 'datalist'">
                <option v-for="(item, idx) in source.range" :key="idx">
                  {{ rangeText(item) }}
                </option>
              </datalist>
            </template>
            <div v-else v-for="(item, idx) in source.range" :key="idx" class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :name="rangeId(item)"
                :id="rangeId(item)"
                :value="rangeValue(item)"
                :checked="value == rangeValue(item)"
                @change="handleRadioChange"
              />
              <label class="form-check-label" :for="rangeId(item)">{{ rangeText(item) }}</label>
            </div>
          </template>
        </template>
        <!-- multi un-ranged -->
        <div class="list-group" v-if="source.multiValued && !source.range && value">
          <div class="list-group-item" v-for="(item, index) in value" :key="index">
            {{ item }}
            <button
              class="btn btn-outline-warning btn-sm float-end"
              @click="removeArrayItem(index)"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="input-group" v-if="source.multiValued && !source.range">
          <input
            class="form-control"
            :name="source.name + suffix"
            type="text"
            @blur="resetInput"
            @keyup.enter="handleMultiEnter"
            @keyup.esc="resetInput"
          />
          <div class="input-group-text">
            <slot name="append">
              <font-awesome-icon icon="list" />
            </slot>
          </div>
        </div>
        <!-- multi ranged -->
        <template v-if="source.multiValued && source.range">
          <div v-for="(item, idx) in source.range" class="form-check" :key="idx">
            <input
              class="form-check-input"
              type="checkbox"
              :name="rangeId(item)"
              :id="rangeId(item)"
              :value="rangeValue(item)"
              :checked="value && value.includes(rangeValue(item))"
              @change="handleCheckboxChange"
              :disabled="disabledRangeItems.includes(rangeValue(item))"
            />
            <label class="form-check-label" :for="rangeId(item)">{{ rangeText(item) }}</label>
          </div>
        </template>
      </template>
      <!-- Show validation message ondemand -->
      <div :class="'invalid-feedback' + (isValid ? '' : ' d-block')" :tabindex="isValid ? 0 : -1">
        {{ feedback }}
      </div>
    </fieldset>
    <slot></slot>
  </div>
</template>

<script>
import moment from 'moment'
import { nextTick } from 'vue'
import { PopoverButton } from '@openclinical/proformajs-vue3-tools'
import EnactmentMarkdown from './EnactmentMarkdown.vue'

export default {
  components: {
    'p-markdown': EnactmentMarkdown,
    't-popover-button': PopoverButton
  },
  emits: ['erase-source', 'update-source', 'send-trigger'],
  props: {
    source: Object,
    disabled: Boolean,
    value: [Array, Boolean, String, Number, Date, Object],
    suffix: String,
    showDescriptionInline: {
      type: Boolean,
      default: false
    },
    hideEraser: {
      type: Boolean,
      default: false
    },
    useButtons: {
      type: Boolean,
      default: false
    },
    useSliders: {
      type: Boolean,
      default: false
    },
    hideCaption: {
      type: Boolean,
      default: false
    },
    hideRequested: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      isValid: true,
      feedback: '',
      localValue: null,
      message: 'Default'
    }
  },
  computed: {
    inlineDescription() {
      return this.showDescriptionInline ? this.source.description : ''
    },
    placeholder() {
      return this.clazz == 'Date' ? 'dd/mm/yyyy' : ''
    },
    useDatalist() {
      return this.source.meta && this.source.meta.ui && this.source.meta.ui.useDatalist
    },
    rangemax() {
      return this.source.meta && this.source.meta.range && this.source.meta.range.max != null
        ? this.source.meta.range.max
        : null
    },
    rangemin() {
      return this.source.meta && this.source.meta.range && this.source.meta.range.min != null
        ? this.source.meta.range.min
        : null
    },
    singleValuedOverride() {
      return this.source.meta &&
        this.source.meta.ui &&
        this.source.meta.ui.singleValuedOverride != null
        ? this.source.meta.ui.singleValuedOverride
        : null
    },
    isNumeric() {
      return this.clazz == 'Integer' || this.clazz == 'Float'
    },
    clazz() {
      // defensively handle situation in a downstream app where enactment data def is serialised with class "Boolean$1"
      return this.source.class.split('$')[0]
    },
    hasSingleValuedOverride() {
      return this.singleValuedOverride !== null
    },
    disabledRangeItems() {
      if (
        this.hasSingleValuedOverride &&
        this.value &&
        this.singleValuedOverride.includes(this.value[0])
      ) {
        return this.source.range.map((item) =>
          item.caption
            ? item.value != this.value[0]
              ? item.value
              : undefined
            : item != this.value[0]
            ? item
            : undefined
        )
      } else {
        return []
      }
    }
  },
  mounted() {
    nextTick(() => {
      if (document.getElementById('target:source' + this.source.path)) {
        this.message = document.getElementById('target:source' + this.source.path).innerHTML
      }
    })
  },
  methods: {
    handleBlur(evt) {
      if (evt.target.value) {
        this.updateValue(evt.target.value)
      }
    },
    handleMultiEnter(evt) {
      if (evt.target.value != null) {
        let value = this.getValue(evt.target.value)
        let arr = this.value || []
        arr.push(value)
        this.$emit('update-source', { action: 'set', source: this.source.name, value: arr })
        evt.target.value = ''
      }
    },
    clearInput(evt) {
      evt.target.value = this.value ? this.value : ''
    },
    resetInput(evt) {
      evt.target.value = ''
    },
    handleRadioChange(evt) {
      this.updateValue(evt.target.value)
    },
    handleCheckboxChange(evt) {
      let value = this.getValue(evt.target.value)
      let arr = this.value || []
      if (this.hasSingleValuedOverride && this.singleValuedOverride.includes(value)) {
        if (evt.target.checked) {
          // unselect other values and disable them
          arr = [value]
        } else {
          arr = []
        }
      } else {
        if (evt.target.checked) {
          arr.push(value)
        } else {
          arr.splice(arr.indexOf(value), 1)
        }
      }
      this.$emit('update-source', { action: 'set', source: this.source.name, value: arr })
    },
    updateValue(text) {
      let val = this.getValue(text)
      if (val != null && val != this.value) {
        this.$emit('update-source', { action: 'set', source: this.source.name, value: val })
      }
      return false
    },
    removeArrayItem(index) {
      let updated = this.value.slice()
      updated.splice(index, 1)
      this.$emit('update-source', { action: 'set', source: this.source.name, value: updated })
    },
    getValue(text) {
      let val
      switch (this.clazz) {
        case 'Integer':
          val = text.includes('e') || Number(text) % 1 !== 0 ? parseFloat(text) : parseInt(text)
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
          val = new moment(text, 'DD/MM/YYYY')
          if (val.isValid()) {
            this.isValid = true
            return val
          } else {
            this.isValid = false
            this.feedback = 'A date must be of the form dd/mm/yyyy'
            return null
          }
        case 'Boolean':
          return text == 'true'
        case 'Text':
          if (this.source.range) {
            if (this.rangeValues(this.source).indexOf(text) > -1) {
              this.isValid = true
              return text
            } else {
              this.isValid = false
              this.feedback = 'Not recognised from available choices'
              return null
            }
          } else {
            this.isValid = true
            return text
          }
        default:
          console.log('unknown class', this.source)
          return text
      }
    },
    inputValue(val) {
      switch (this.clazz) {
        case 'Date':
          return val ? moment(val).format('DD/MM/YYYY') : ''
        default:
          return val
      }
    },
    rangeValue(item) {
      return Object.keys(item).includes('value') ? item.value : item
    },
    rangeValues(source) {
      return source.range.map((item) => this.rangeValue(item))
    },
    rangeText(item) {
      return Object.keys(item).includes('caption') ? item.caption : item
    },
    booleanSourceRangeText(item) {
      return Object.keys(item).includes('caption') ? item.caption : item ? 'True' : 'False'
    },
    rangeId(item) {
      return (
        this.source.name + (Object.keys(item).includes('value') ? item.value : item) + this.suffix
      )
    },
    unsetSource() {
      this.$emit('erase-source', { action: 'unset', source: this.source.name })
    }
  }
}
</script>

<style scoped>
.btn.active:disabled {
  color: var(--bs-btn-active-color);
  background-color: var(--bs-btn-active-bg);
}
</style>
