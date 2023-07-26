import Redis from 'ioredis';
import { parentPort } from 'worker_threads';

export class Context {
  constructor(redis: Redis.Redis, scope: string,parentPort:any) {
    this.redis = redis
    this.scope = scope
    this.parentPort=parentPort
  }
  private parentPort:MessagePort
  /**
   *
   * Redis connection instance
   *
   */
  private redis: Redis.Redis
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
    return new Promise<boolean>((resolve, reject) => {
      this.parentPort.postMessage({ redisHset: { scope:this.scope, name: name, value: value } });

      const messageHandler = (payload) => {
          if('redisHset_response' in payload) {
            resolve(payload.redisHset_response);
          }
      };

      this.parentPort.on('message', messageHandler);
    });
  }

  /**
   * get, read context var
   */
  public async get(name: string): Promise<string | null> {
    //return await this.redis.hget(this.scope, name);
    return new Promise<string | null>((resolve, reject) => {
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
