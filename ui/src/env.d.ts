/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMetaEnv {
  VITE_API_PREFIX: string
}
declare module 'vue-writer'
declare module 'tinycolor2'
declare module 'Vue3ColorPicker'
