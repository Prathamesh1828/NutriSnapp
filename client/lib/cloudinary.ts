import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: string | Buffer,
  folder: string = 'nutrisnap',
  options: { width?: number; height?: number; crop?: string } = {}
): Promise<{ url: string; publicId: string }> {
  const uploadOptions = {
    folder,
    resource_type: 'image' as const,
    transformation: options.width || options.height ? [{
      width: options.width || 800,
      height: options.height,
      crop: options.crop || 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    }] : [{
      quality: 'auto',
      fetch_format: 'auto',
    }],
  };

  let result;
  if (typeof file === 'string') {
    result = await cloudinary.uploader.upload(file, uploadOptions);
  } else {
    result = await new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error || !result) reject(error || new Error('Upload failed'));
          else resolve(result);
        }
      );
      stream.end(file);
    });
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
