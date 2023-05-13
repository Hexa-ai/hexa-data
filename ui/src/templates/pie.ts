import { Template } from '../Contracts/Template'
export const tile: Template = {
  script: `{
  'token' $readToken
  'class' 'YOUR VARIABLE/GTS NAME' // Start with ~ for regex (Eg: '~FIRST VARIABLE/GTS|SECOND VARIABLE/GTS' fetch two variables/GTS '~.*' fetch all variables/GTS )
  'labels' {}
  'count' 1
  'end' NOW
} FETCH { NULL NULL } RELABEL 'data' STORE
//
// Custom data
//
// [
//     { 'key' 'series-1' 'value' 12 }
//     { 'key' 'series-2' 'value' 15 }
//     { 'key' 'series-3' 'value' 3 }
// ] 'data' STORE
{
    'data' $data
    'globalParams' {
      'bgColor' NULL
      'scheme' 'ECTOPLASM' // MATRIX, ECTOPLASM, VIRIDIS, MAGMA, NINETEEN_EIGHTY_FOUR, CTHULHU
    }
}`,
}
