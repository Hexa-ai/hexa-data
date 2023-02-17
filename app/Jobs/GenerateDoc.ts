import Drive from '@ioc:Adonis/Core/Drive'
import Document from './../Modules/Datas/Models/Document'

export default class GenerateCsv {
  /**
   *
   * Convert array to CSV
   *
   * @param inputArray array
   * @param separator  string
   */
  private toCSV(inputArray, separator = ',') {
    let rowsAsString = inputArray.map((row) => {
      return row.join(separator)
    })
    const csvFormat = rowsAsString.join('\n')
    return csvFormat
  }
  /**
   *
   * Handle the Job
   *
   * @param payload
   */
  public async handle(payload: any) {
    let content: string = payload.fileData.toString()

    if (payload.extName === 'pdf') {
      await Drive.put(payload.filePath, Buffer.from(payload.fileData.data))
    } else if (payload.extName === 'csv') {
      content = JSON.parse(payload.fileData)
      await Drive.put(payload.filePath, this.toCSV(content, ';'))
    } else {
      content = JSON.parse(payload.fileData)
      await Drive.put(payload.filePath, content)
    }

    // Update document state
    const doc = await Document.find(payload.docId)
    doc!.file!.isPersisted = true
    doc!.inProgress = false
    await doc?.save()
  }
}
