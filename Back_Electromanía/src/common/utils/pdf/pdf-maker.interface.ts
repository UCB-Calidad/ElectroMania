import { OrderReceiptModel } from '../../../order/models/order-response.model';

export interface PdfMaker {
  generatePDF(orderData: OrderReceiptModel): Promise<Buffer>;
}
