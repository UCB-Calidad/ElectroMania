import { Injectable } from '@nestjs/common';
import { randomBytes, randomInt, randomUUID } from 'node:crypto';
@Injectable()
export class CryptoService {
  generateToken(bytes: number = 32): string {
    return randomBytes(bytes).toString('hex');
  }
  generateNumericCode(length: number = 6): number {
    let min = Math.pow(10, length - 1);
    let max = Math.pow(10, length) - 1;
    return randomInt(min, max);
  }
  generateRandomUUID(): string {
    return randomUUID();
  }
}
