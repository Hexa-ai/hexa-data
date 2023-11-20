const defaultTheme = require('./ui/node_modules/tailwindcss/defaultTheme')
module.exports = {
  content: ['./ui/index.html', './ui/src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    // colors: {
    //   indigo: {600:'#a5f3fc'},
    // },
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('./ui/node_modules/@tailwindcss/forms')],
}
