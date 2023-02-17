import LoggerService from "App/Services/LoggerService"
export interface I_Log {
  dateTime: string
  opreration: string
  message: string
  data: string
}
export class OpLoggerService extends LoggerService {
  public getLogs(): I_Log[] {
    return this.buffer.map(function(log){
      const convertedLog : I_Log = {
        dateTime: log.dateTime.toString(),
        opreration: log.msg[0],
        message: log.msg[1],
        data: log.msg[2]
      }
      return convertedLog
    })
  }
}
