import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as generatePassword from 'generate-password';

@Injectable()
export class PasswordService {
  constructor(private readonly config: ConfigService) {}
  async hashPassword(password: string): Promise<string> {
    const rounds = this.config.get<number>('bcrypt.saltRounds');
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateStrongPassword(): string {
    return generatePassword.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      strict: true,
    });
  }
}
