import { createServer } from 'http'
import { RabbitMQAdapter } from './services/message-broker/RabbitMQAdapter'

(async () => {
  const rabbitMQAdapter = new RabbitMQAdapter()

  await rabbitMQAdapter.connect()

  rabbitMQAdapter.on('image-processed', (msg: any) => {
    console.log('Receive a message coming from queue image-processed', msg)
  })

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

      rabbitMQAdapter.publish('image', { image: imageBase64 }, {
        persistent: true
      })

      response.writeHead(200, defaultHeaders)

      response.write(JSON.stringify({ success: true }))
      return response.end()
    }

    response.writeHead(200, defaultHeaders)
    return response.end()
  }).listen(3000, () => { console.log('Running at 3000') })
})()