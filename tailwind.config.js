const defaultTheme = require('./ui/node_modules/tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./ui/index.html', './ui/src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    "--rounded-box": "5rem",
    // colors: {
    //   indigo: {600:'#a5f3fc'},
    // },
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'primary-50': 'rgb(var(--primary-50))',
        'primary-100': 'rgb(var(--primary-100))',
        'primary-200': 'rgb(var(--primary-200))',
        'primary-300': 'rgb(var(--primary-300))',
        'primary-400': 'rgb(var(--primary-400))',
        'primary-500': 'rgb(var(--primary-500))',
        'primary-600': 'rgb(var(--primary-600))',
        'primary-700': 'rgb(var(--primary-700))',
        'primary-800': 'rgb(var(--primary-800))',
        'primary-900': 'rgb(var(--primary-900))',
        'primary-950': 'rgb(var(--primary-950))',
        'surface-0': 'rgb(var(--surface-0))',
        'surface-50': 'rgb(var(--surface-50))',
        'surface-100': 'rgb(var(--surface-100))',
        'surface-200': 'rgb(var(--surface-200))',
        'surface-300': 'rgb(var(--surface-300))',
        'surface-400': 'rgb(var(--surface-400))',
        'surface-500': 'rgb(var(--surface-500))',
        'surface-600': 'rgb(var(--surface-600))',
        'surface-700': 'rgb(var(--surface-700))',
        'surface-800': 'rgb(var(--surface-800))',
        'surface-900': 'rgb(var(--surface-900))',
        'surface-950': 'rgb(var(--surface-950))'
      },
    },
  },
  plugins: [
    require('./ui/node_modules/@tailwindcss/forms'),
    require("./ui/node_modules/daisyui")
  ],

  daisyui: {
    themes: [
      {
        hexadata: {
          ...require("./ui/node_modules/daisyui/src/theming/themes")["light"],
          "--rounded-box": "0.3rem",

          primary: "#635faf",
          "primary-content": "#ffffff",
          secondary: "#3579bd",
          "secondary-content": "#ffffff",
          accent: "#e664c3",
          "accent-content": "#ffffff",
          neutral: "#d8dde4",
          "neutral-content": "#00110e",
          info: "#3579bd",
          "info-content": "#ffffff",
          success: "#62aa81",
          "success-content": "#ffffff",
          warning: "#e7af59",
          "warning-content": "#ffffff",
          error: "#d2491b",
          "error-content": "#ffffff",

          ".btn-smd": {
            "height": "2.5rem",
            "min-height": "2.5rem"
          },

          ".textarea": {
            "font-size": "1em",
            "line-height": "24px",
          },

          ".label-text": {
            "font-weight": 600,
            "padding-left": 0
          }
        },
      },
    ]
  },
}
