import { Injectable } from '@nestjs/common';
import { ImageStorage } from './image-storage.interface';
import { join, parse } from 'node:path';
import config from '../../../config/Configuration';
import * as sharp from 'sharp';
import { promises as fs } from 'node:fs';

@Injectable()
export class LocalImageStorage implements ImageStorage {
  async upload(file: Express.Multer.File): Promise<string> {
    const uploadDir = join(process.cwd(), 'uploads/products');
    await fs.mkdir(uploadDir, { recursive: true });

    const { name } = parse(file.filename);
    const outputPath = join(uploadDir, `${name}.webp`);

    await sharp(file.path)
      .resize(800, 800, { fit: 'inside' })
      .webp({ quality: 70 })
      .toFile(outputPath);

    await fs.unlink(file.path);

    return `${config().apiDomain.url}/uploads/products/${name}.webp`;
  }
}
