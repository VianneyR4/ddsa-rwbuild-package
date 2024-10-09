<docs>
Draws an enactment task.  If it's state is in_progress then the task is
interactable.

# props

* enactment - a PROformajs enactment
* task - a PROformajs enactment task
* options - display options object

# events

* send-trigger
</docs>

<template>
  <div v-if="task">
    <h3>
      <span v-if="!hideTaskCaption || !task.description">{{ task.caption || task.name }}</span>
      <span class="badge text-bg-warning ms-2" v-show="task.state != 'in_progress'">{{
        task.state
      }}</span>
    </h3>
    <p-markdown
      v-if="task.description"
      :text="task.description"
      @send-trigger="$emit('send-trigger', $event)"
    />
    <div v-if="task.sources">
      <hr />
      <div class="row">
        <template v-if="sources.length > 0">
          <div class="col" v-if="sources.length == 1 || singleColumn">
            <p-source
              suffix="task"
              v-for="source in sources"
              :key="source.type"
              :source="source"
              :disabled="task.state != 'in_progress'"
              :value="enactment.get(task.path, source.type)"
              @erase-source="updateSource"
              @update-source="updateSource"
              :hideEraser="hideEraser"
              :showDescriptionInline="showDescriptionInline"
              :useButtons="useButtons"
              :useSliders="useSliders"
              :hideCaption="hideSourcesCaptions"
              :hideRequested="hideRequestedIcon"
            >
              <hr />
            </p-source>
          </div>
          <template v-else>
            <div class="col-md-6">
              <p-source
                suffix="task"
                v-for="source in sourceCols[0]"
                :key="source.type"
                :source="source"
                :disabled="task.state != 'in_progress'"
                :value="enactment.get(task.path, source.type)"
                @erase-source="updateSource"
                @update-source="updateSource"
                :hideEraser="hideEraser"
                :showDescriptionInline="showDescriptionInline"
                :useButtons="useButtons"
                :useSliders="useSliders"
                :hideCaption="hideSourcesCaptions"
                :hideRequested="hideRequestedIcon"
              >
                <hr />
              </p-source>
            </div>
            <div class="col-md-6">
              <p-source
                suffix="task"
                v-for="source in sourceCols[1]"
                :key="source.type"
                :source="source"
                :disabled="task.state != 'in_progress'"
                :value="enactment.get(task.path, source.type)"
                @erase-source="updateSource"
                @update-source="updateSource"
                :hideEraser="hideEraser"
                :showDescriptionInline="showDescriptionInline"
                :useButtons="useButtons"
                :useSliders="useSliders"
                :hideCaption="hideSourcesCaptions"
                :hideRequested="hideRequestedIcon"
              >
                <hr />
              </p-source>
            </div>
          </template>
        </template>
        <h3 v-else class="text-muted">{{ noSourcesMessage }}</h3>
      </div>
    </div>
    <template v-if="task.candidates">
      <hr />
      <template v-if="!showRecommendedOnly">
        <p-candidate
          v-for="candidate in sortedCands"
          :key="candidate.path"
          class="candidate mt-1"
          :task="task"
          :candidate="candidate"
          :options="options"
          @update-confirmed="handleConfirmedChange"
        />
      </template>
      <template v-else>
        <p-candidate
          v-for="candidate in sortedCands.filter((cand) => cand.recommended)"
          :key="candidate.path"
          class="candidate mt-1"
          :task="task"
          :candidate="candidate"
          :options="options"
          @update-confirmed="handleConfirmedChange"
        />
        <h3
          v-if="sortedCands.filter((cand) => cand.recommended).length == 0"
          class="text-muted mb-2"
        >
          {{ noRecommendationsMessage }}
        </h3>
        <div
          v-if="!hideUnrecommended"
          class="accordion accordion-flush my-2"
          id="unrecommendedAccordian"
        >
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#unrecommended"
                aria-expanded="false"
                aria-controls="unrecommended"
              >
                {{ unrecommendedHeader }}
              </button>
            </h2>
            <div
              id="unrecommended"
              class="accordion-collapse collapse"
              data-bs-parent="#unrecommendedAccordian"
            >
              <div class="accordion-body">
                <p-candidate
                  v-for="candidate in sortedCands.filter((cand) => !cand.recommended)"
                  :key="candidate.path"
                  class="candidate mt-1"
                  :task="task"
                  :candidate="candidate"
                  :options="options"
                  @update-confirmed="handleConfirmedChange"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
    <template v-if="showCompleteButton">
      <div
        role="group"
        class="btn-group float-end"
        v-if="task.candidates && options.Decision.allowDownloads"
      >
        <button
          class="btn btn-outline-secondary btn-sm"
          v-if="task.candidates"
          @click="downloadData"
        >
          <font-awesome-icon icon="file-download" />
        </button>
        <button
          class="btn btn-info"
          @click="$emit('update-enactment', { action: 'complete', path: task.path })"
          :disabled="!task.completeable"
        >
          {{ completeButtonText }}
        </button>
      </div>
      <button
        class="btn btn-success float-end next-button"
        v-else
        @click="$emit('update-enactment', { action: 'complete', path: task.path })"
        :disabled="!task.completeable"
      >
        {{ completeButtonText }}
      </button>
    </template>
    <p-expression
      v-if="options.debug"
      :enactment="enactment"
      :path="task.path"
      :description="debugDescription"
      class="mt-5"
      it="task"
    />
  </div>
  <div v-else>
    <h3>No active task</h3>
    <p class="text-muted">Sending a trigger or adding new data may change this state...</p>
  </div>
</template>

<script>
import EnactmentSource from './EnactmentSource.vue'
import EnactmentExpression from './EnactmentExpression.vue'
import EnactmentMarkdown from './EnactmentMarkdown.vue'
import EnactmentCandidate from './EnactmentCandidate.vue'
import FileSaver from 'file-saver'

function dependentDataDefs(decision) {
  // console.debug('dependentDataDefs - called', decision)
  let result = []
  function merge(expression) {
    if (typeof expression != 'undefined') {
      var referenced = []
      for (const def of decision.allDataDefinitions()) {
        if (expression.indexOf(def.name) > -1) {
          referenced.push(def.name)
          if (def.valueCondition) {
            merge(def.valueCondition)
          }
        }
      }
      for (const def of referenced) {
        if (result.indexOf(def) == -1) {
          result.push(def)
        }
      }
    }
  }
  // check which dataDefinitions are referenced in the decision expressions
  for (const candidate of decision.candidates) {
    merge(candidate.recommendCondition)
    for (const argument of candidate.arguments) {
      merge(argument.activeCondition)
    }
  }
  // console.debug('dependentDataDefs - returns', result)
  return result
}

export default {
  name: 'p-task',
  props: ['task', 'enactment', 'options'],
  components: {
    'p-source': EnactmentSource,
    'p-expression': EnactmentExpression,
    'p-markdown': EnactmentMarkdown,
    'p-candidate': EnactmentCandidate
  },
  emits: ['send-trigger', 'update-enactment'],
  data: function () {
    return {
      path: '',
      managedCandidates: new Set([]) // candidates that have been manually (un)confirmed
    }
  },
  created() {
    this.path = this.task ? this.task.path : undefined
  },
  computed: {
    sortedCands: function () {
      if (this.task.candidates) {
        let result = this.task.candidates.slice().sort((left, right) => {
          if ((left.recommended && right.recommended) || (!left.recommended && !right.recommended))
            return right.support - left.support
          else if (left.recommended) return -1 // left recommended by not right
          else return 1 // right recommended but not left
        })
        return result
      } else {
        return []
      }
    },
    debugDescription: function () {
      return 'Evaluate expression in the context of this task (' + this.task.path + ')'
    },
    sources() {
      if (this.task.sources && this.task.sources.length > 0) {
        if (this.showRequestedOnly) {
          return this.task.sources.filter((src) => src.requested)
        } else {
          return this.task.sources
        }
      } else {
        return []
      }
    },
    sourceCols() {
      if (this.sources.length > 0) {
        if (this.sources.length == 2) {
          return [[this.sources[0]], [this.sources[1]]]
        } else {
          let lens = []
          for (const source of this.sources) {
            if (source.range) {
              lens.push(3 + source.range.length - 1)
            } else if (source.class == 'Boolean') {
              lens.push(4)
            } else {
              lens.push(3)
            }
          }
          // using floor here means that occasionally the second column
          // will be just longer than the first.
          let halfsum = Math.floor(lens.reduce((acc, cum) => acc + cum) / 2)
          let cum = 0
          let idx = 0
          // increment idx until you get to the half way point
          while (cum < halfsum) {
            cum = cum + lens[idx]
            idx++
          }
          return [this.sources.slice(0, idx), this.sources.slice(idx)]
        }
      } else {
        return [[], []]
      }
    },
    // meta options
    showCompleteButton() {
      // might be an idea to deprecate this option and replace with hideComplete
      return this.getMetaProperty(['showComplete', 'ui']) === false ? false : true
    },
    completeButtonText() {
      return this.getMetaProperty(['buttonText', 'ui']) || 'Next'
    },
    showDescriptionInline() {
      return this.getMetaProperty(['showDescriptionInline', 'sources', 'ui'])
    },
    hideEraser() {
      return this.getMetaProperty(['hideEraser', 'sources', 'ui'])
    },
    useButtons() {
      return this.getMetaProperty(['useButtons', 'sources', 'ui'])
    },
    useSliders() {
      return this.getMetaProperty(['useSliders', 'sources', 'ui'])
    },
    hideSourcesCaptions() {
      return this.getMetaProperty(['hideCaptions', 'sources', 'ui'])
    },
    hideTaskCaption() {
      return this.getMetaProperty(['hideCaption', 'task', 'ui'])
    },
    singleChoiceDecision() {
      return this.getMetaProperty(['singleChoice', 'decision', 'ui'])
    },
    hideWeights() {
      return this.getMetaProperty(['hideWeights', 'arguments', 'ui']) || false
    },
    hideRequestedIcon() {
      // hides the icon that indicates a source is requested
      // hideRequested is deprecated and replaced by hideRequestedIcon
      return (
        this.getMetaProperty(['hideRequestedIcon', 'sources', 'ui']) ||
        this.getMetaProperty(['hideRequested', 'sources', 'ui'])
      )
    },
    showRequestedOnly() {
      // filters the list of sources - only shows requested sources
      return this.getMetaProperty(['showRequestedOnly', 'sources', 'ui'])
    },
    noSourcesMessage() {
      return this.getMetaProperty(['noSourcesMessage', 'sources', 'ui']) || 'No sources available'
    },
    singleColumn() {
      return this.getMetaProperty(['singleColumn', 'sources', 'ui']) || false
    },
    showRecommendedOnly() {
      return this.getMetaProperty(['showRecommendedOnly', 'decision', 'ui']) || false
    },
    noRecommendationsMessage() {
      // used if showRecommendedOnly == true
      return (
        this.getMetaProperty(['noRecommendationsMessage', 'decision', 'ui']) ||
        'No recommendations available'
      )
    },
    hideUnrecommended() {
      // relevant if showRecommendedOnly == true
      return this.getMetaProperty(['hideUnrecommended', 'decision', 'ui'])
    },
    unrecommendedHeader() {
      // used if showRecommendedOnly == true && showUnrecommend == false
      return this.getMetaProperty(['unrecommendedHeader', 'decision', 'ui']) || 'Not recommended'
    }
  },
  methods: {
    updateSource(data) {
      data.path = this.task.path
      this.$emit('update-enactment', data)
    },
    handleConfirmedChange(evt) {
      let name = evt.path.split(':').pop()
      if (this.singleChoiceDecision) {
        // unselect existing choice
        let existing = this.task.candidates.find((cand) => cand.confirmed).name
        if (existing) {
          this.managedCandidates.add(existing) // adding existing to the managed candidates list stops it automatically overriding
          this.$emit('update-enactment', {
            action: 'unconfirm',
            path: this.task.path + ':' + existing
          })
        }
      }
      this.managedCandidates.add(name)
      this.$emit('update-enactment', evt)
    },
    downloadData() {
      let headings = ''
      let values = ''
      let decision = this.enactment.protocol.getComponent(this.task.path)
      for (const name of dependentDataDefs(decision)) {
        let def = decision.allDataDefinitions().find((dd) => dd.name == name)
        if (typeof def.valueCondition == 'undefined') {
          headings = headings + name + '\t'
          const val = JSON.stringify(this.enactment.get(def._parent.path(), name))
          values = values + (typeof val == 'undefined' ? '' : val) + '\t'
        }
      }
      for (const [idx, cand] of decision.candidates.entries()) {
        headings = headings + cand.name
        let candidate = this.task.candidates.find((c) => c.name == cand.name)
        values = values + candidate.confirmed
        if (idx < decision.candidates.length - 1) {
          headings = headings + '\t'
          values = values + '\t'
        }
      }
      FileSaver.saveAs(
        new Blob([headings + '\n' + values], { type: 'text/plain;charset=utf-8' }),
        this.task.name + '.tsv'
      )
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
  },
  watch: {
    task(newtask) {
      if (newtask && newtask.path !== this.path) {
        this.path = newtask.path
        this.managedCandidates.clear()
        // on completing a task, scroll to the top of the next task
        // see https://stackoverflow.com/questions/40730116/scroll-to-bottom-of-div-with-vue-js
        const container = this.$el
        this.$nextTick(() => {
          container.ownerDocument.body.firstElementChild.scrollIntoView()
        })
      }
      if (this.options.Candidate.autoConfirmRecommended && newtask && newtask.candidates) {
        for (let candidate of newtask.candidates) {
          if (
            candidate.confirmed !== candidate.recommended &&
            !this.managedCandidates.has(candidate.name)
          ) {
            let path = this.task.path + ':' + candidate.name
            let action = candidate.recommended ? 'confirm' : 'unconfirm'
            this.$emit('update-enactment', { action: action, path: path })
          }
        }
      }
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
