import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ImageStorage } from './image-storage.interface';
import { unlink } from 'node:fs/promises';
import * as sharp from 'sharp';
import { join, parse } from 'node:path';
import config from '../../../config/Configuration';
import { randomBytes } from 'node:crypto';

@Injectable()
export class CloudinaryImageStorage implements ImageStorage {
  constructor() {
    cloudinary.config({
      cloud_name: config().cloudinary.cloud_name,
      api_key: config().cloudinary.api_key,
      api_secret: config().cloudinary.api_secret,
    });
  }

  async upload(
    file: Express.Multer.File,
    folder = 'products',
  ): Promise<string> {
    const optimizedPath = this.getOptimizedPath(file.path);

    try {
      await sharp(file.path)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 75 })
        .toFile(optimizedPath);
      const result = await cloudinary.uploader.upload(optimizedPath, {
        folder: `electromania/${folder}`,
        resource_type: 'image',
      });

      if (!result?.secure_url) {
        throw new InternalServerErrorException('Cloudinary upload failed');
      }

      return result.secure_url;
    } finally {
      await unlink(file.path).catch(() => {});
      await unlink(optimizedPath).catch(() => {});
    }
  }

  async delete(url: string): Promise<void> {
    const publicId = url.split('/').pop()?.split('.')[0];
    if (!publicId) return;

    await cloudinary.uploader.destroy(`products/${publicId}`);
  }

  private getOptimizedPath(originalPath: string): string {
    const { dir, name } = parse(originalPath);
    const timestamp = Date.now();
    const random = randomBytes(16).toString('hex');
    return join(dir, `${name}-${timestamp}-${random}.webp`);
  }
}
