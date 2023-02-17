export const tile = {
  script: `{
  'token' $readToken
  'class' 'YOUR VARIABLE/GTS NAME' // Start with ~ for regex (Eg: '~.*' select all classnames)
  'labels' {}
  'count' 1
  'end' NOW
} FETCH 0 GET VALUES 0 GET 'data' STORE
{
  'data' $data
  'globalParams' {
    'bgColor' NULL
    'fontColor' NULL
    'unit' '°C'
  }
}`
}

