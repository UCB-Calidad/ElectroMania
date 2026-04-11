import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ImageStorage } from './image-storage.interface';
import * as sharp from 'sharp';
import { unlink } from 'node:fs/promises';
import { join, parse } from 'node:path';
import config from '../../../config/Configuration';
import { randomBytes } from 'node:crypto';

@Injectable()
export class R2ImageStorage implements ImageStorage {
  private readonly s3: S3Client;
  private readonly publicUrl: string;
  private readonly buckets: Record<string, string>;

  constructor() {
    const cf = config().cloudflare;
    this.publicUrl = cf.publicUrl;
    this.buckets = cf.buckets;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: cf.r2_endpoint,
      credentials: {
        accessKeyId: cf.access_key,
        secretAccessKey: cf.secret_key,
      },
      forcePathStyle: true,
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: keyof typeof this.buckets = 'products',
  ): Promise<string> {
    const bucket = this.buckets[folder];

    if (!bucket) {
      throw new InternalServerErrorException(
        `Bucket not configured for ${folder}`,
      );
    }

    const optimizedPath = this.getOptimizedPath(file.path);
    const fileName = `${Date.now()}.webp`;
    const key = `${folder}/${fileName}`;

    try {
      await sharp(file.path)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(optimizedPath);

      const buffer = await sharp(optimizedPath).toBuffer();

      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: 'image/webp',
          ContentLength: buffer.length,
        }),
      );

      return `${this.publicUrl}/${key}`;
    } catch (error) {
      console.error('R2 upload failed:', error);
      throw new InternalServerErrorException('R2 upload failed');
    } finally {
      await unlink(file.path).catch(() => {});
      await unlink(optimizedPath).catch(() => {});
    }
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith(this.publicUrl)) return;

    const key = url.replace(`${this.publicUrl}/`, '');
    const bucketName = key.split('/')[0];
    const bucket = this.buckets[bucketName];

    if (!bucket) return;

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  private getOptimizedPath(originalPath: string): string {
    const { dir, name } = parse(originalPath);
    const timestamp = Date.now();
    const random = randomBytes(16).toString('hex');
    return join(dir, `${name}-${timestamp}-${random}.webp`);
  }
}
