import { string } from '@ioc:Adonis/Core/Helpers'

export default class CsvService {
  static toCsv (modelCollection: any[], delimiter: string = ";") {
    // rows: object[],
    const rows: any[] = modelCollection.map((model: any) => {
      return model.serialize()
    })
    if (!rows || !rows.length) {
      return null
    }
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(delimiter) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell
        }).join(delimiter)
      }).join('\n')
    return csvContent
  }
  static fromCsv(str:string, delimiter:string = ";") {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.search(/\r\n|\r|\n/)).split(delimiter)
    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const isCrLf = !(-1==str.search("\r\n"))
    let rows: string[]
    if (isCrLf) {
      rows = str.slice(str.search(/\r\n/)+2).split(/\r\n/)
    } else {
      rows = str.slice(str.search(/\r|\n/)+1).split(/\r|\n/)
    }
    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const filteredRows = rows.filter(function (row) {
      if (! string.isEmpty(row)) {
        return row
      }
    })
    const arr = filteredRows.map(function (row) {
      const values = row.split(delimiter)
      const el = headers.reduce(function (object, header, index) {
        object[header] = values[index]
        return object
      }, {});
      return el
    });

    // return the array
    return arr;
  }
}
