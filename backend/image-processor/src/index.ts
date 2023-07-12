import amqp from 'amqplib'
import { setTimeout } from 'timers/promises'
import path from 'path'
import sharp from 'sharp'
import { addTextOverlayToImage } from './helpers/add-text-overlay-image'

(async () => {
  const connection = await amqp.connect('amqp://micro-rabbitmq:5672')

  const channel = await connection.createChannel()

  await channel.consume('image', async (msg) => {
    if (msg) {
      console.log('Message arrived', msg.properties.messageId)
      
      const imageBuffer = Buffer.from(msg.content.toString(), 'base64')

      const fileName = `${new Date().getTime()}.png`

      const pathToSave = path.join('src', 'files', 'images', fileName)

      const imageMetadata = await sharp(imageBuffer).metadata()

      const svgBuffer = await addTextOverlayToImage({ width: imageMetadata.width!, height: imageMetadata.height!, text: 'Slideworks' })

      sharp(imageBuffer)
        .composite([
          {
            input: svgBuffer,
            top: 0,
            left: 0,
          }
        ])
        .toFile(pathToSave, (err, _) => {
          if (err) return console.log('ERROR', err)

          console.log('IMAGE SAVED')
        })

      channel.ack(msg)

      await setTimeout(3000)

      channel.sendToQueue('image-processed', Buffer.from("imagem processada"))
    }
  })

  console.log('Waiting messages...')
})()