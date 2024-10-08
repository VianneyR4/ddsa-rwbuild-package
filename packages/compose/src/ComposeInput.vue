<docs>
Provides the means to review and edit a PROformajs component's text-valued attribute with an html input field

# props

* att - attribute
* comp - component
* label - attribute label (optional - defaults to "de camel cased" name)
* type - text/number (optional - defaults to 'text')
* description - input help text (optional)

# events

* change-attribute - signals the need to update the component's attribute value
</docs>

<template>
  <div>
    <label :for="att" class="col-form-label pt-0">{{ labelValue }}</label>
    <input
      :type="typeValue"
      class="form-control form-control-sm"
      :id="att"
      :value="Array.isArray(comp[att]) ? JSON.stringify(comp[att]) : comp[att]"
      @change="$emit('change-attribute', { name: att, value: parse($event.target.value) })"
      :disabled="disabled"
    />
    <!-- Array.isArray(comp[att]) ? JSON.stringify(comp[att]) :  -->
    <small v-if="description" id="passwordHelpBlock" class="form-text text-muted">{{
      description
    }}</small>
  </div>
</template>

<script>
import { AttributeMixin, TypeMixin } from './attribute'
export default {
  mixins: [AttributeMixin, TypeMixin],
  emits: ['change-attribute'],
  methods: {
    parse: (val) => {
      try {
        return JSON.parse(val)
      } catch (e) {
        return val
      }
    }
  }
}
</script>

<style scoped>
/* needed to distinguish values from placeholders in flatly bootswatch style */
input {
  color: black;
}
</style>
