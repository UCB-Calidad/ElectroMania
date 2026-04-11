import { PaymentStatus } from './register-payment.dto';

export class UpdatePaymentDto {
  id: number;
  status: PaymentStatus;
}
