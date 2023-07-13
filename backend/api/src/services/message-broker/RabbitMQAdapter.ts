import amqp, { Connection, Options } from 'amqplib'
import { IBroker } from "./BrokerInterfaceAdapter";
import { setTimeout } from 'timers/promises'

class RabbitMQAdapter implements IBroker {
  private connection!: Connection;

  async connect(): Promise<any> {
    try {
      this.connection = await amqp.connect('amqp://micro-rabbitmq:5672')

      this.connection.on('close', async (reason) => {
        await this.retryConnect(reason)
      })

      console.log('Successfully connected to Rabbitmq')
    } catch (err) {
      await this.retryConnect(err)
    }
  }

  private async retryConnect(disconnectReason: any): Promise<void> {
    //TODO: Add log to server to save when something is wrong with connection to track it
    console.log('Error to connect on Rabbitmq, trying to connect again')

    await setTimeout(10000)

    this.connect()
  }

  async on(queueName: string, callback: Function): Promise<any> {
    const channel = await this.connection.createChannel()
    await channel.assertQueue(queueName, { durable: true })
    channel.consume(queueName, async (msg) => {
      if (msg) {
        const input = JSON.parse(msg?.content.toString())
        await callback(input)
        channel.ack(msg)
      }
    })
  }
  async publish(queueName: string, data: any, options?: Options.Publish): Promise<any> {
    const channel = await this.connection.createChannel()
    await channel.assertQueue(queueName, { durable: true })
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { ...options })
  }

}
export { RabbitMQAdapter }