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
    app.component('font-awesome-icon', FontAwesomeIcon);
}

// Create module definition for app.use()
export default install

// import styles from packages
import '/packages/perform/dist/style.css';
import '/packages/tools/dist/style.css';
import '/packages/compose/dist/style.css';

// export components from map, tools and compose
// export * from '@openclinical/proformajs-vue3-compose';
export * from './packages/tools/index.js';
// export * from '@openclinical/proformajs-vue3-map';

// dont export default from perform...
export {
  PerformProtocol,
  EnactmentMarkdown,
  EnactmentSettings,
  EnactmentMixin
} from './packages/perform/index.js';
