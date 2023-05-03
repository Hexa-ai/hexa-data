import { Template } from '../Contracts/Template'
export const tile: Template = {
  script: `//
// Fetching datas
// $dtStart and $dtEnd come from the dashboard date picker
//
$dtStart TOLONG 'dtStart' STORE
$dtEnd TOLONG 'dtEnd' STORE
$dtEnd $dtStart - 'interval' STORE

{
  'token' $readToken
  'class' 'YOUR VARIABLE/GTS NAME' // Start with ~ for regex (Eg: '~FIRST VARIABLE/GTS|SECOND VARIABLE/GTS' fetch two variables/GTS '~.*' fetch all variables/GTS )
  'labels' {}
  'start' $dtStart
  'end' $dtEnd
} FETCH { NULL NULL } RELABEL 'data' STORE

//
// Applies the Buketize Framework
//
// [ $data bucketizer.mean 0 10 m 0 ] BUCKETIZE 'data' STORE

//
// Applies the Mapper Framework
//
// [ $data mapper.delta 1 0 0 ] MAP 'data' STORE

//
// With custom datas
//
// {
//   'title' 'Test'
//   'columns' [ 'A' 'B' 'C' 'D' ]
//   'rows' [
//     [ 'label X' 15 56 44 22 ]
//     [ 'label Y' 1 5 4 2 ]
//     [ 'label Z' 14 45 78 12 ]
//   ]
// } 'data' STORE
{
  'data' $data
  'globalParams' {
    'bgColor' NULL
    'scheme' 'ECTOPLASM' // MATRIX, ECTOPLASM, VIRIDIS, MAGMA, NINETEEN_EIGHTY_FOUR, CTHULHU
    'hideYAxis' true
    'hideXAxis' true
    'showDots' false
    'timeMode' 'date'
    'timeZone' 'AUTO'
    // 'bounds' {
    //   'minDate' $dtStart
    //   'maxDate' $dtEnd
    // }
    'bar' {
      'horizontal' false
      'stackerd' false
    }
  }
  // 'params' [
  //   { 'datasetColor' '#dc3545' 'xAxis' 0 'type' 'area' }
  // ]
}`,
}
