// import sharp from 'sharp';

interface IAddTextOverlayToImage {
  width: number;
  height: number;
  text: string;
  textColor?: string;
}

async function addTextOverlayToImage({ width, height, text, textColor = "#000" }: IAddTextOverlayToImage) {
  const fontSizeCalcule = (width * height) * 0.005 / 100

  const anchorSvg = `
  <svg width="${width}" height="${height}">
    <style>
      .title { fill: ${textColor}; font-size: ${fontSizeCalcule}px; font-weight: bold; }
    </style>
      <text x="50%" y="50%" text-anchor="middle" class="title">${text}</text>
    </svg>`;

  const svgBuffer = Buffer.from(anchorSvg)

  // const svgBufferUpdated = await sharp(svgBuffer).rotate(45).resize(width, height).toBuffer({ resolveWithObject: true })

  return svgBuffer
}

export { addTextOverlayToImage }