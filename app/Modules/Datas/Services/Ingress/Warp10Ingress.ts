export default class Warp10Ingress {
  protected buffer: Record<string, any>
  protected bufferFlushInterval: number = 1000

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
    // Prepare the warp10 ingress payload
    let payload = ''
    for (const token of Object.keys(this.buffer)) {
      const { classname, value, labels, timestamp } = this.buffer[token]
      payload +=
        this.formatTimestamp(timestamp) +
        '// ' +
        classname +
        this.formatLabels(labels) +
        ' ' +
        this.formatValue(value)
    }

    // Reset the buffer
    this.buffer = {}

    // Call the warp10 ingress endpoint
    // TODO: implement warp10 ingress endpoint

    // Call the flushBuffer method again after the buffer flush interval
    setTimeout(() => {
      this.flushBuffer()
    }, this.bufferFlushInterval)
  }

  protected formatLabels(labels: Record<string, string>) {
    const parts: string[] = []

    for (const [key, value] of Object.entries(labels)) {
      parts.push(key + '=' + value)
    }

    return '{' + parts.join(',') + '}'
  }

  protected formatTimestamp(timestamp: number) {
    return timestamp * 1000
  }

  protected formatValue(value: any) {
    // If the value is a number, we return it as a string with 1 decimal
    if (typeof value === 'number' && !isNaN(value)) {
      return value % 1 === 0 ? value.toFixed(1) : value.toString()
    }

    // If the value is a boolean we return it as T or F
    if (typeof value === 'boolean') {
      return value ? 'T' : 'F'
    }

    // If the value is a string, we return it as a quoted string
    if (typeof value === 'string') {
      return '"' + value + '"'
    }

    return value
  }
}
