export interface ImageStorage {
  upload(file: Express.Multer.File, folder?: string): Promise<string>;
  delete?(url: string): Promise<void>;
}
