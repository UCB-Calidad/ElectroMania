export class RegisterPaymentDto {
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
}

export enum PaymentMethod {
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}
