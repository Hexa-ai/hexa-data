import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory, useRoute } from 'vue-router'
import VueWriter from 'vue-writer'
import './index.css'
import App from './App.vue'
import { RouteService } from '../src/Classes/RouteService'

const Login = () => import('./pages/Login.vue')
const Register = () => import('./pages/Register.vue')
const PasswordForgotten = () => import('./pages/PasswordForgotten.vue')
const Projects = () => import('./pages/Projects/Index.vue')
const ProjectCreate = () => import('./pages/Projects/Create.vue')
const ProjectsEdit = () => import('./pages/Projects/Show.vue')
const ProjectsUsers = () => import('./pages/Projects/Users.vue')
const ProjectsUserProfile = () => import('./pages/Projects/UserProfile.vue')
const Users = () => import('./pages/Users/Index.vue')
const User = () => import('./pages/Users/Show.vue')
const Profile = () => import('./pages/Users/Profile.vue')
const UserCreate = () => import('./pages/Users/Create.vue')
const Settings = () => import('./pages/Settings/Index.vue')
const AppVersion = () => import('./pages/Settings/AppVersion.vue')
const Dashboards = () => import('./pages/Dashboards/Index.vue')
const Dashboard = () => import('./pages/Dashboards/Show.vue')
const DashboardReport = () => import('./pages/Dashboards/ShowReport.vue')
const DashboardEdit = () => import('./pages/Dashboards/Edit.vue')
const DashboardCreate = () => import('./pages/Dashboards/Create.vue')
const Documents = () => import('./pages/Documents/Index.vue')
const Reports = () => import('./pages/Reports/Index.vue')
const Devices = () => import('./pages/Devices/Index.vue')
const Device = () => import('./pages/Devices/Show.vue')
const NotFound = () => import('./layouts/NotFound.vue')
const DeviceCreate = () => import('./pages/Devices/Create.vue')
const Variables = () => import('./pages/Tags/Variables/index.vue')
const Variable = () => import('./pages/Tags/Variables/show.vue')
const VariableCreate = () => import('./pages/Tags/Variables/Create.vue')
const Macros = () => import('./pages/Tags/Macros/index.vue')
const Macro = () => import('./pages/Tags/Macros/Show.vue')
const MacroCreate = () => import('./pages/Tags/Macros/Create.vue')
const Texts = () => import('./pages/Tags/Texts/Index.vue')
const TextCreate = () => import('./pages/Tags/Texts/Create.vue')
const Text = () => import('./pages/Tags/Texts/Show.vue')
const NodeRed = () => import('./pages/nodered/Index.vue')

import fr from './locales/fr.json'
import en from './locales/en.json'
import es from './locales/es.json'
import de from './locales/de.json'

const newLocal = 'en'
const i18n = createI18n({
  locale: 'fr', // set locale
  fallbackLocale: 'fr', // set fallback locale
  messages: { fr: fr, en: en, es: es, de: de },
})
const routes = [
  { path: '/', component: Login },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot-password', component: PasswordForgotten },
  { path: '/projects', component: Projects },
  { path: '/projects/create', component: ProjectCreate },
  { path: '/projects/:id', component: () => import('./pages/Projects/ShowInfos.vue') },
  { path: '/projects/:id/users', component: ProjectsUsers },
  { path: '/projects/:id/users/:userId', component: ProjectsUserProfile },
  { path: '/projects/:id/settings', component: ProjectsEdit },
  { path: '/projects/:id/documents', component: Documents },
  { path: '/projects/:id/reports', component: Reports },
  { path: '/projects/:id/dashboards', component: Dashboards },
  { path: '/projects/:id/dashboards/create', component: DashboardCreate },
  { path: '/projects/:id/dashboards/:dashboardId', component: Dashboard },
  { path: '/projects/:id/dashboards-report/:writeToken/:dashboardId', component: DashboardReport },
  { path: '/projects/:id/dashboards/edit/:dashboardId', component: DashboardEdit },
  { path: '/projects/:id/devices', component: Devices },
  { path: '/projects/:id/nodered', component: NodeRed },
  { path: '/projects/:id/variables', component: Variables },
  { path: '/projects/:id/variables/create', component: VariableCreate },
  { path: '/projects/:id/variables/:tagId', component: Variable },
  { path: '/projects/:id/macros', component: Macros },
  { path: '/projects/:id/macros/create', component: MacroCreate },
  { path: '/projects/:id/macros/:tagId', component: Macro },
  { path: '/projects/:id/devices/:deviceId', component: Device },
  { path: '/projects/:id/devices/create', component: DeviceCreate },
  { path: '/projects/:id/texts', component: Texts },
  { path: '/projects/:id/texts/create', component: TextCreate },
  { path: '/projects/:id/texts/:tagId', component: Text },
  { path: '/users', component: Users },
  { path: '/users/:userId', component: User },
  { path: '/users/profile/:userId', component: Profile },
  { path: '/users/create', component: UserCreate },
  { path: '/settings', component: Settings },
  { path: '/settings/version', component: AppVersion },
  { path: '/:catchAll(.*)', component: NotFound },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(),
  routes, // short for `routes: routes`
})

router.beforeEach( async (to, from, next) => {
  // Vérifiez si l'utilisateur navigue vers une route commençant par /projects
  if (to.path.startsWith('/projects/')) {
    console.log(to)
    await RouteService.getProjectInfos(to)
  }
  // Continuez de naviguer vers la route demandée
  next();
});

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(VueWriter)
app.mount('#app')


const doc = document.documentElement;

// Fonction pour définir le niveau de zoom
function setZoom(zoom:number) {
  (doc.style as any).zoom = zoom;
 }

setZoom(0.88);
