import { DateTime } from 'luxon'

interface Log {
  dateTime: DateTime,
  msg: string[]
}
export default class LoggerService {
  public buffer: Log[] = []

  public append(msg:any[]) {
    const log : Log = {
      dateTime:DateTime.now(),
      msg: msg.map(value=>value.toString()),
    }
    this.buffer.push(log)
  }
  public getLogs() {
    return this.buffer.map(function(log){
      return {
        dateTime: log.dateTime.toString(),
        message: log.msg.toString()
      }
    })
  }
  public clearLogs() {
    this.buffer = []
  }

}
