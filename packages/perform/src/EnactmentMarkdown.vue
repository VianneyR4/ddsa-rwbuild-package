<docs>
Presents text as markdown with an extension that triggers can be raised with
links that look like: ``[trigger description](!trigger)``.

requested prop is used by EnactmentSource to indicate that a source is requested
in particular circumstances.
</docs>

<template>
  <div v-html="html" @send-trigger="handleTrigger"></div>
</template>

<script>
import { marked } from 'marked'
import createDOMPurify from 'dompurify'

const purify = createDOMPurify()
purify.addHook('afterSanitizeAttributes', function (node) {
  // post process trigger links to fire the send-trigger event
  if (
    node &&
    node.className &&
    node.className.indexOf &&
    node.className.indexOf('pf-trigger') > -1
  ) {
    const trigger = node.className.match(/js-[a-z0-9_]+/i)[0].substring(3)
    node.setAttribute(
      'onclick',
      'this.dispatchEvent(new CustomEvent("send-trigger", {bubbles: true, detail: "' +
        trigger +
        '"}))'
    )
  }
})

const newTabIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="icon newtab-icon" viewBox="0 0 512 512">
  <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com 
    License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
  <path d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 
  265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 
  22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V32c0-17.7-14.3-32-32-32H352zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 
  80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 
  16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/>
  </svg>`

const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="icon run-icon" viewBox="0 0 512 512">
  <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com 
    License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
    <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512
     0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 
     20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/><
     /svg>`

export default {
  props: {
    text: String,
    requested: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    html() {
      // make a custom renderer to handle trigger links (markdown urls which look like "!trigger")
      const renderer = new marked.Renderer()
      renderer.link = function (href, title, text) {
        if (href.startsWith('!')) {
          let trigger = href.substring(1)
          return `<u class="text-success clickable pf-trigger js-${trigger}"><span>${text}</span>${playIcon}</u>`
        } else {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" alt="${title}"><span>${text}</span>${newTabIcon}</a>`
        }
      }

      return purify.sanitize(
        marked(this.text + (this.requested ? '<span class="text-primary ml-2">*</span>' : ''), {
          gfm: true,
          renderer: renderer
        }),
        {
          ADD_ATTR: ['target', 'rel'],
          ADD_TAGS: ['svg']
        }
      )
    }
  },
  methods: {
    handleTrigger(evt) {
      this.$emit('send-trigger', evt.detail)
    }
  }
}
</script>

<style>
/* add markdown class to remove bottom margin of last paragraph */
.markdown :last-child {
  margin-bottom: 0;
}

/* scoped css won't work for the following styles (vhtml) */
.icon {
  margin-left: 5px;
  width: 0.85em;
  height: 0.85em;
  vertical-align: middle;
}

.newtab-icon {
  fill: var(--bs-blue);
}
.run-icon {
  fill: var(--bs-green);
}
</style>
