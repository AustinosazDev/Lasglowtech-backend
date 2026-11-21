const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isEnabled = Boolean(cloudName && apiKey && apiSecret);

if (isEnabled) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} opts - { folder, publicId, resourceType ('image'|'video'|'raw'|'auto'), overwrite }
 * @returns {Promise<string>} secure_url
 */
const uploadBuffer = (buffer, { folder = 'lasglowtech', publicId, resourceType = 'auto', overwrite = false, format, deliveryType } = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite,
        format,
        type: deliveryType,
        use_filename: !publicId,
        unique_filename: !publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

module.exports = { cloudinary, isEnabled, uploadBuffer };
