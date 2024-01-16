import PrimeVue from 'primevue/config'
import Lara from '@/presets/lara/index'
import Card from 'primevue/card'
import DataView from 'primevue/dataview'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Dialog from 'primevue/dialog'
import Chip from 'primevue/chip'
import Tag from 'primevue/tag'
import Tooltip from 'primevue/tooltip'
import Sidebar from 'primevue/sidebar'

export default (app: any) => {
  app.use(PrimeVue, {
    unstyled: true,
    pt: Lara,
  })
  app.component('Card', Card)
  app.component('DataView', DataView)
  app.component('ConfirmDialog', ConfirmDialog)
  app.use(ConfirmationService)
  app.component('Toast', Toast)
  app.use(ToastService)
  app.component('Dialog', Dialog)
  app.component('Chip', Chip)
  app.component('Tag', Tag)
  app.directive('tooltip', Tooltip)
  app.component('Sidebar', Sidebar)
}
