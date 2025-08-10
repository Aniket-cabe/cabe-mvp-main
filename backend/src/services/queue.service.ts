import Bull from 'bull';
import Redis from 'ioredis';

export class QueueService {
  private static redis: Redis;
  private static queues: Map<string, Bull.Queue> = new Map();

  static initialize() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnClusterDown: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  static getQueue(name: string): Bull.Queue {
    if (!this.queues.has(name)) {
      const queue = new Bull(name, {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  static async addJob(
    queueName: string,
    data: any,
    options?: Bull.JobOptions
  ): Promise<Bull.Job> {
    const queue = this.getQueue(queueName);
    return await queue.add(data, options);
  }

  static async processJob(
    queueName: string,
    processor: Bull.ProcessCallbackFunction<any>
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    queue.process(processor);
  }
}
