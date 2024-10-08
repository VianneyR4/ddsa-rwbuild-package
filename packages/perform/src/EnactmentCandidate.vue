<template>
  <div class="candidate mt-1">
    <div class="row g-0">
      <div style="width: 56px">
        <div class="float-end" style="margin-top: 3px">
          <!-- recommended / rejected icon -->
          <span class="text-primary me-2" :disabled="task.state != 'in_progress'">
            <font-awesome-icon icon="check" v-if="candidate.recommended" />
            <font-awesome-icon icon="times" v-if="candidate.support == '--'" />
          </span>
          <!-- checkbox, candidate caption and net_support -->
          <input
            v-if="singleChoiceDecision"
            type="radio"
            :name="task.name"
            :value="candidate.name"
            :id="candidate.name"
            :checked="candidate.confirmed"
            @change="handleConfirmedChange"
            :disabled="task.state != 'in_progress'"
            class="mt-1 me-2"
          />
          <input
            v-else
            type="checkbox"
            :name="candidate.name"
            :id="candidate.name"
            :checked="candidate.confirmed"
            @change="handleConfirmedChange"
            :disabled="task.state != 'in_progress'"
            class="mt-1 me-2"
          />
        </div>
      </div>
      <div class="col">
        <label :for="candidate.name" :disabled="task.state != 'in_progress'" class="mb-0">
          <span class="Enactment-candidate">{{ candidate.caption || candidate.name }}</span>
          <span
            class="badge rounded-pill bg-secondary ms-1 align-middle mb-1"
            v-show="
              !hideWeights &&
              candidate.support != 0 &&
              candidate.support != Infinity &&
              candidate.support != -Infinity
            "
            :disabled="task.state != 'in_progress'"
            >{{ candidate.support }}</span
          >
        </label>
        <p-markdown
          v-if="showCandidateDescriptionInline && candidate.description"
          :text="candidate.description"
          class="mb-1 markdown"
        />
        <t-popover-button
          v-if="!showCandidateDescriptionInline && candidate.description"
          class="ps-1 p-0"
        >
          <p-markdown :text="candidate.description" />
        </t-popover-button>
        <div v-if="options.Decision.showExpressions" class="text-muted font-italic">
          {{ candidate.recommendCondition }}
        </div>
      </div>
    </div>
    <div
      v-for="(argument, index) in candidate.arguments"
      :key="index"
      :data-key="index"
      class="row g-0"
    >
      <div v-if="argument.active" style="width: 90px">
        <div class="float-end pe-2">
          <span
            v-if="
              !hideWeights &&
              Math.abs(argument.support) > 1 &&
              Math.abs(argument.support) < Infinity
            "
            class="text-muted meta me-1"
            >{{ Math.abs(argument.support) }}</span
          >
          <font-awesome-icon
            v-if="argument.support == Infinity"
            icon="plus-circle"
            class="text-success"
          />
          <font-awesome-icon
            v-if="argument.support > 0 || argument.support == '++'"
            icon="plus-circle"
            class="text-success"
          />
          <font-awesome-icon
            v-if="argument.support < 0 || argument.support == '--'"
            icon="minus-circle"
            class="text-danger"
          />
          <font-awesome-icon
            v-if="argument.support == -Infinity"
            icon="minus-circle"
            class="text-danger ms-1"
          />
        </div>
      </div>
      <div
        v-if="!argument.active && options.Decision.showInactiveArguments"
        style="width: 90px"
        class="text-muted"
      >
        <div class="float-end pe-2">
          <span
            v-if="
              !hideWeights &&
              Math.abs(argument.support) > 1 &&
              Math.abs(argument.support) < Infinity
            "
            class="text-muted meta me-1"
            >{{ Math.abs(argument.support) }}</span
          >
          <font-awesome-icon v-if="argument.support == '++'" icon="plus-circle" />
          <font-awesome-icon v-if="argument.support == Infinity" icon="plus-circle" />
          <font-awesome-icon
            v-if="argument.support > 0 || argument.support == '++'"
            icon="plus-circle"
          />
          <font-awesome-icon v-if="argument.support == -Infinity" icon="minus-circle" />
          <font-awesome-icon
            v-if="argument.support < 0 || argument.support == '--'"
            icon="minus-circle"
          />
          <font-awesome-icon v-if="argument.support == '--'" icon="minus-circle" />
        </div>
      </div>
      <div class="col">
        <div v-if="argument.active">
          {{ argument.caption }}
          <template v-if="argument.description">
            <p-markdown
              v-if="showArgumentDescriptionInline"
              :text="argument.description"
              class="mb-1 markdown text-muted"
            />
            <t-popover-button v-else class="p-1">
              <p-markdown :text="argument.description" class="mb-1 markdown text-muted" />
            </t-popover-button>
          </template>
          <div v-if="options.Decision.showExpressions" class="text-muted font-italic">
            {{ argument.activeCondition }}
          </div>
        </div>
        <div
          v-if="!argument.active && options.Decision.showInactiveArguments"
          class="d-inline-block"
        >
          <span class="text-muted">
            {{ argument.caption }}
          </span>
          <div v-if="options.Decision.showExpressions" class="text-muted font-italic">
            {{ argument.activeCondition }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EnactmentMarkdown from './EnactmentMarkdown.vue'
import { PopoverButton } from '@openclinical/proformajs-vue3-tools'

export default {
  name: 'p-candidate',
  props: ['task', 'candidate', 'options'],
  components: {
    'p-markdown': EnactmentMarkdown,
    't-popover-button': PopoverButton
  },
  emits: ['update-confirmed'],
  computed: {
    // meta options
    showArgumentDescriptionInline() {
      return this.getMetaProperty(['showDescriptionInline', 'arguments', 'ui'])
    },
    showCandidateDescriptionInline() {
      return this.getMetaProperty(['showDescriptionInline', 'candidates', 'ui'])
    },
    singleChoiceDecision() {
      return this.getMetaProperty(['singleChoice', 'decision', 'ui'])
    },
    hideWeights() {
      return this.getMetaProperty(['hideWeights', 'arguments', 'ui']) || false
    }
  },
  methods: {
    handleConfirmedChange(evt) {
      let path =
        this.task.path + ':' + (this.singleChoiceDecision ? evt.target.value : evt.target.name)
      if (evt.target.checked) {
        this.$emit('update-confirmed', { action: 'confirm', path: path })
      } else {
        this.$emit('update-confirmed', { action: 'unconfirm', path: path })
      }
    },
    getMetaProperty(props) {
      function _getMetaProperty(obj, _props) {
        if (_props.length == 0) {
          return obj
        } else {
          const prop = _props.pop()
          return Object.getOwnPropertyNames(obj).includes(prop)
            ? _getMetaProperty(obj[prop], _props)
            : null
        }
      }
      return _getMetaProperty(this.task.meta, props)
    }
  }
}
</script>
<style scoped>
.meta {
  font-size: x-small;
}

.Enactment-candidate {
  font-size: larger;
  font-weight: bolder;
}

.markdown :last-child {
  margin-bottom: 0;
}
</style>
