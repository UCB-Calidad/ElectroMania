import { extname, join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
export const productMulterConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, join(process.cwd(), 'uploads', 'tmp'));
    },
    filename: (req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 2000000, // 2MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Solo imágenes'), false);
    }
    cb(null, true);
  },
  // Si quieres permitir solo un archivo, puedes usar 'single' en lugar de 'array' o 'fields'
};
