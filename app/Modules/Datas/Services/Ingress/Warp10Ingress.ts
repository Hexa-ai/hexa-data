import axios from 'axios'
import Logger from '@ioc:Adonis/Core/Logger'

const FLUSH_BUFFER_INTERVAL = 1 // In seconds

export default class Warp10Ingress {
  protected buffer: Record<string, any>

  public constructor() {
    this.buffer = {}
    this.flushBuffer()
  }

  public async push({ token, classname, value, labels = {}, timestamp = null }) {
    // Create buffer entry for the token if not exists
    if (!(token in this.buffer)) {
      this.buffer[token] = []
    }

    // Push the new value into the buffer
    this.buffer[token].push({
      classname,
      value,
      labels,
      timestamp: timestamp || Date.now(),
    })
  }

  public async flushBuffer() {
    // Copy the buffer and reset it, so we can continue to push values while the buffer is flushing
    // with no risk of losing values in the buffer
    const currentBuffer = { ...this.buffer }
    this.buffer = {}

    // Prepare the promise pool of axios requests
    const promises: Promise<any>[] = []
    for (const token of Object.keys(currentBuffer)) {
      // Populate the payload to send to the warp10 ingress
      let payload = ''
      for (const { classname, value, labels, timestamp } of currentBuffer[token]) {
        payload +=
          this.formatTimestamp(timestamp) +
          '// ' +
          classname +
          this.formatJson({ ... labels, type: this.getValueType(value) }) +
          ' ' +
          this.formatValue(value) +
          '\n'
      }

      // Push the request to the promise pool
      promises.push(
        axios.post(process.env.WARP10_ENDPOINT + '/api/v0/update', payload, {
          headers: {
            'X-Warp10-Token': token,
          },
        })
      )

      Logger.info('Pushing ' + currentBuffer[token].length + ' entrie(s) to Warp10 (token ' + token + ')')
    }

    // Wait for all the requests to be done
    await Promise.all(promises)

    // Call the flushBuffer method again after the buffer flush interval
    setTimeout(() => {
      this.flushBuffer()
    }, FLUSH_BUFFER_INTERVAL * 1000)
  }

  protected formatJson(labels: Record<string, string>) {
    const parts: string[] = []

    for (const [key, value] of Object.entries(labels)) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
    }

    return '{' + parts.join(',') + '}'
  }

  protected formatTimestamp(timestamp: number) {
    return timestamp * 1000
  }

  protected formatValue(value: any) {
    const valueType = this.getValueType(value)

    // If the value is a number, we return it as a string with 1 decimal
    if (valueType === 'number') {
      return value % 1 === 0 ? value.toFixed(1) : value.toString()
    }

    // If the value is a boolean we return it as T or F
    if (valueType === 'boolean') {
      return value ? 'T' : 'F'
    }

    // If the value is a string, we return it as a quoted string
    if (valueType === 'string') {
      return '"' + value + '"'
    }

    return value
  }

  protected getValueType(value: any) {
    if (typeof value === 'number' && !isNaN(value)) {
      return 'number'
    }

    if (typeof value === 'boolean') {
      return 'boolean'
    }

    if (typeof value === 'string') {
      return 'string'
    }

    throw new Error('unsupported value type')
  }
}
