import { runInContext, createContext } from 'vm';
import { parentPort } from 'worker_threads';
import { HexaData } from './HDLib/HexaData';



parentPort!.on('message', async (inputMsg) => {
  if ('script' in inputMsg) {
    let script = inputMsg.script
    let payload = inputMsg.payload
    console.log('payload')

    console.log(payload)

    let projectId = inputMsg.projectId
    let readToken = inputMsg.readToken
    let writeToken = inputMsg.writeToken
    let redisConfig = inputMsg.redisConfig
    let macroId = inputMsg.macroId
    let warp10EndPoint = inputMsg.warp10EndPoint
    let redis = inputMsg.redis

    let output:string[]=[]
    let execError = false
    let executionTime=0
    let startTime= 0
    let endTime= 0

    let sandbox = createContext({
      console: {
        log: (message) => {
          parentPort!.postMessage({consoleLog:{message:message}});
          if (message instanceof (Promise)) {
            output.push('<Promise>')
          } else {
            output.push(message)
          }
        }
      },
      setInterval:setInterval,
      setTimeout:setTimeout,
      hd: new HexaData(redis, projectId, warp10EndPoint, readToken, writeToken, parentPort, macroId),
      readToken: readToken,
      writeToken: writeToken,
      payload:payload
    });
    try {
      startTime = performance.now();
      output.push(await runInContext(script, sandbox))
      endTime = performance.now();
    } catch (error) {
      endTime = performance.now();
      const stackWithoutPaths = error.stack.replace(/at .* \((.*):\d+:\d+\)/g, 'xxxx');
      output = [error.message, stackWithoutPaths, error.name, error.fileName, error.lineNumber, error.columnNumber]
      execError = true
    }
    executionTime = endTime - startTime;
    let outputMsg = { execResult: { output: output, execError: execError, elapsed: executionTime } }
    console.log(outputMsg)
    if (outputMsg.execResult.output[0]!=null || outputMsg.execResult.execError==true){
      parentPort!.postMessage(outputMsg);
    }

  }

});
