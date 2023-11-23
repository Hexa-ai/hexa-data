import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme'
export const content = ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}']
export const theme = {
  extend: {
    fontFamily: {
      sans: ['Inter var', ..._fontFamily.sans],
    },
  },
}
export const plugins = [require('@tailwindcss/forms')]
