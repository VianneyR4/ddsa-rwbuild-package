import ComposeProtocol from './src/ComposeProtocol.vue'
import ComposeTask from './src/ComposeTask.vue'
import ComposeCode from './src/ComposeCode.vue'

// fontawesome icons
import { library } from '@fortawesome/fontawesome-svg-core'
import {
    faEdit,
    faAsterisk,
    faInfoCircle,
    faEraser,
    faList,
    faCalendarAlt,
    faCheck,
    faTimes,
    faPlusCircle,
    faMinusCircle,
    faRedoAlt,
    faExclamationTriangle,
    faDirections,
    faTable,
    faHandPointer,
    faHistory,
    faClipboardCheck,
    faFileDownload,
    faCog
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(
    faFileDownload,
    faEdit,
    faAsterisk,
    faInfoCircle,
    faEraser,
    faList,
    faCalendarAlt,
    faCheck,
    faTimes,
    faPlusCircle,
    faMinusCircle,
    faRedoAlt,
    faExclamationTriangle,
    faDirections,
    faTable,
    faHandPointer,
    faHistory,
    faClipboardCheck,
    faCog
)

// install function executed by app.use()
const install = function installProformajsVue(app) {
    app.component(ComposeProtocol);
    app.component(ComposeTask);
    app.component(ComposeCode);
    app.component('font-awesome-icon', FontAwesomeIcon);
    // app.directive('focus', {
    //   inserted: function (el) {
    //     Vue.nextTick(function () {
    //       el.focus()
    //     })
    //   }
    // })
}

// Create module definition for app.use()
export default install

export {
    ComposeProtocol,
    ComposeTask,
    ComposeCode,
}