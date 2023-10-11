export class Context {
  constructor(scope: string,parentPort:any) {
    this.scope = scope
    this.parentPort=parentPort
  }
  private parentPort:any
  /**
   *
   * Macro ProjectId
   *
   */
  private scope: string

  /**
   * set, write context var
   */
  public async set(name: string, value: any): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.parentPort.postMessage({ redisHset: { scope:this.scope, name: name, value: value } });

      const messageHandler = (payload) => {
          if('redisHset_response' in payload) {
            resolve(payload.redisHset_response);
          }
      };
      // @ts-ignore
      this.parentPort.on('message', messageHandler);
    });
  }

  /**
   * get, read context var
   */
  public async get(name: string): Promise<string | null> {
    //return await this.redis.hget(this.scope, name);
    return new Promise<string | null>((resolve) => {
      this.parentPort.postMessage({ redisHget: { scope:this.scope, name: name } });

      const messageHandler = (payload) => {
          if('redisHget_response' in payload) {
            resolve(payload.redisHget_response);
          }
      };

      this.parentPort.on('message', messageHandler);
    });
  }
}
