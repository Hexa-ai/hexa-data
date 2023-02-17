export const tile = {
  script: `{
  'token' $readToken
  'class' 'YOUR VARIABLE/GTS NAME' // Start with ~ for regex (Eg: '~.*' select all classnames)
  'labels' {}
  'count' 1
  'end' NOW
} FETCH   0 GET VALUES 0 GET  'data' STORE
{
  'data' $data
  'globalParams' {
    'bgColor' NULL
    'scheme' 'ECTOPLASM' // MATRIX, ECTOPLASM, VIRIDIS, MAGMA, NINETEEN_EIGHTY_FOUR, CTHULHU
    'unit' '°C'
    'gauge' {
      'horizontal' true
      'showTicks' true
    }
  }
  // 'params' [
  //   {
  //     'maxValue' 100
  //     'datasetColor'
  //       <% $data 12 < %> <% 'blue' %>
  //       <% $data 20 > %> <% 'green' %>
  //       <% $data 25 > %> <% 'orange' %>
  //       <% $data 35 > %> <% 'red' %>
  //       <% 'gray' %> 4 SWITCH
  //   }
  // ]
}`
}

