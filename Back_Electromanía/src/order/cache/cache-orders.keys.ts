export class CacheOrderKeys {
  static readonly allOrders = 'orders';
  static readonly ORDER = 'order';
  static orderByID(orderId: number) {
    return `order-${orderId}`;
  }
  static orderByUser(userUuid: string) {
    return `order-by-user-${userUuid}`;
  }
}
