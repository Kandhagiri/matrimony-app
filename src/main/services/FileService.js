const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp module not available, image compression will be disabled:', error.message);
  sharp = null;
}

class FileService {
  constructor(appDataPath) {
    this.appDataPath = appDataPath;
    this.imagesPath = path.join(appDataPath, 'images');
  }

  async saveImage(imageData, profileId, imageId) {
    // Ensure images directory exists
    if (!fs.existsSync(this.imagesPath)) {
      fs.mkdirSync(this.imagesPath, { recursive: true });
    }

    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Compress image using Sharp if available
    if (sharp) {
      try {
        const compressedBuffer = await sharp(buffer)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        const fileName = `${profileId}_${imageId}.jpg`;
        const filePath = path.join(this.imagesPath, fileName);
        fs.writeFileSync(filePath, compressedBuffer);

        return {
          path: filePath,
          fileName,
          size: compressedBuffer.length,
        };
      } catch (error) {
        console.error('Error compressing image with Sharp:', error);
        // Fall through to save original
      }
    }
    
    // Fallback: save original image if Sharp is not available or compression fails
    const fileName = `${profileId}_${imageId}.jpg`;
    const filePath = path.join(this.imagesPath, fileName);
    fs.writeFileSync(filePath, buffer);

    return {
      path: filePath,
      fileName,
      size: buffer.length,
    };
  }

  async deleteImage(imagePath) {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return true;
    }
    return false;
  }

  getImagePath(fileName) {
    return path.join(this.imagesPath, fileName);
  }
}

module.exports = FileService;



