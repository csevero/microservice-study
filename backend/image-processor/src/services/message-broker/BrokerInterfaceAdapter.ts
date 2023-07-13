
import { Options, ConsumeMessage } from "amqplib";

export interface IBroker {
  connect(): Promise<any>;
  on(queueName: string, callback: (msg: ConsumeMessage) => void): Promise<any>;
  publish(queueName: string, data: any, options?: Options.Publish): Promise<any>
}