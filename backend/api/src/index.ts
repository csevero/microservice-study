import amqp from 'amqplib'
import { createServer } from 'http'

(async () => {
  const connection = await amqp.connect('amqp://micro-rabbitmq:5672')

  const channel = await connection.createChannel()
  const imageQueue = await channel.assertQueue('image')
  const imageProcessedQueue = await channel.assertQueue('image-processed')

  channel.consume('image-processed', (msg) => {
    if (msg) {
      console.log('Receive a message coming from queue image', msg?.content.toString())

      channel.ack(msg)
    }
  })

  console.log(`${imageQueue.queue} created`)
  console.log(`${imageProcessedQueue.queue} created`)

  createServer(async (request, response) => {
    const defaultHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    };

    if (request.url === "/upload" && request.method?.toLocaleLowerCase() === "post") {
      let requestChunks = ''
      for await (const data of request) {
        requestChunks += data.toString()
      }
      const base64Converted = JSON.parse(requestChunks)

      const [_, imageBase64] = base64Converted.image.split(',')

      channel.sendToQueue('image', Buffer.from(imageBase64))

      response.writeHead(200, defaultHeaders)

      response.write(JSON.stringify({ success: true }))
      return response.end()
    }

    response.writeHead(200, defaultHeaders)
    return response.end()
  }).listen(3000, () => { console.log('Running at 3000') })
})()