import amqp from 'amqplib'
import path from 'path'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import { addTextOverlayToImage } from './helpers/add-text-overlay-image'
import { RabbitMQAdapter } from './services/message-broker/RabbitMQAdapter'

(async () => {
  const rabbitMQAdapter = new RabbitMQAdapter()

  await rabbitMQAdapter.connect()



  await rabbitMQAdapter.on('image', async (msg: any) => {
    if (msg) {
      console.log('Receive a message coming from queue image')

      const imageBuffer = Buffer.from(msg.image, 'base64')

      const fileName = `${new Date().getTime()}.png`

      const pathToSave = path.join('src', 'files', 'images', fileName)

      const imageMetadata = await sharp(imageBuffer).metadata()

      // const svgBuffer = await addTextOverlayToImage({ width: imageMetadata.width!, height: imageMetadata.height!, text: 'Slideworks', textColor: '#00ff00' })

      // const waterMark = await readFile(path.join('src', 'files', 'watermarks', 'logo.svg'))

      // const waterMarkMetadata = await sharp(waterMark).metadata()

      sharp(imageBuffer)
        .composite([
          // {
          //   input: waterMark,
          //   top: Math.ceil((imageMetadata.height! / 2) - (waterMarkMetadata.height! / 2)),
          //   left: Math.ceil((imageMetadata.width! / 2) - (waterMarkMetadata.width! / 2)),
          // }
          // {
          //   input: svgBuffer,
          //   top: 0,
          //   left: 0,
          // }
        ])
        .toFile(pathToSave, (err, _) => {
          if (err) return console.log('ERROR', err)

          console.log('IMAGE SAVED')
        })

      rabbitMQAdapter.publish('image-processed', { success: true, fileName }, { persistent: true })
    }
  })

  console.log('Waiting messages...')
})()