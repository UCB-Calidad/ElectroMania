import { ValueObject } from '../../../common/interfaces/ValueObject';

export class Email extends ValueObject<string> {
  public constructor(value: string) {
    super(value);
    this.isValidEmail(value);
  }
  private isValidEmail(email: string) {
    if (!email.includes('@')) {
      throw new Error('Invalid Email: Email most be have @');
    }
  }
}
