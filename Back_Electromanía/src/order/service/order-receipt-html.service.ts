import { Injectable } from '@nestjs/common';
import { OrderReceiptModel } from '../models/order-response.model';

@Injectable()
export class OrderReceiptService {
  generateReceiptHtml(orderData: OrderReceiptModel): string {
    const itemsHtml = orderData.orderItems
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Bs. ${Number(item.unit_price).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Bs. ${Number(item.total).toFixed(2)}</td>
        </tr>
      `,
      )
      .join('');

    const paymentStatus = orderData.payment
      ? `
        <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #0369a1; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#0369a1" stroke-width="2"/>
              <path d="M2 10h20" stroke="#0369a1" stroke-width="2"/>
            </svg>
            Información de Pago
          </h3>
          <p style="margin: 5px 0;"><strong>Método:</strong> ${orderData.payment.method.translate}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> ${orderData.payment.status.translate}</p>
          <p style="margin: 5px 0;"><strong>Monto:</strong> Bs. ${Number(orderData.payment.amount).toFixed(2)}</p>
        </div>
      `
      : `
        <div style="margin-top: 20px; padding: 15px; background: #fef2f2; border-radius: 5px;">
          <p style="color: #dc2626; font-weight: bold; margin: 0; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.5 3.84 10 10 10s10-4.5 10-10V7L12 2z" stroke="#dc2626" stroke-width="2" fill="none"/>
              <path d="M12 8v4m0 4h.01" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Pago Pendiente
          </p>
        </div>
      `;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo - Orden #${orderData.order_id}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .receipt {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 10px 0 0 0;
      color: #1e40af;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-section {
      padding: 15px;
      background: #f8fafc;
      border-radius: 5px;
    }
    .info-section h3 {
      margin: 0 0 10px 0;
      color: #334155;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-section p {
      margin: 5px 0;
      color: #64748b;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    th:last-child, td:last-child {
      text-align: right;
    }
    .total-section {
      text-align: right;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .total-section h2 {
      margin: 0;
      color: #1e40af;
      font-size: 24px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #64748b;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-paid {
      background: #d1fae5;
      color: #065f46;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 2L7 6H3C2.45 6 2 6.45 2 7v1c0 .55.45 1 1 1h1l2 11c.1.5.5.9 1 .9h10c.5 0 .9-.4 1-.9l2-11h1c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4l-2-4H9z" fill="#1e40af"/>
          <circle cx="9" cy="21" r="1" fill="#1e40af"/>
          <circle cx="17" cy="21" r="1" fill="#1e40af"/>
        </svg>
        RECIBO DE COMPRA
      </h1>
      <p style="margin: 10px 0 0 0; color: #64748b;">
      Orden #${orderData.order_id}</p>
      <span class="status-badge status-${orderData.status.value.toLowerCase()}">${orderData.status.translate}</span>
    </div>

    <div class="order-info">
      <div class="info-section">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#334155" stroke-width="2"/>
            <path d="M8 2v4M16 2v4M3 10h18" stroke="#334155" stroke-width="2"/>
          </svg>
          Información de la Orden
        </h3>
        <p><strong>Fecha:</strong> ${new Date(
          orderData.created_at,
        ).toLocaleString('es-BO', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}</p>
        <p><strong>Estado:</strong> ${orderData.status.translate}</p>
      </div>

      <div class="info-section">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="#334155" stroke-width="2"/>
            <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#334155" stroke-width="2"/>
          </svg>
          Información del Cliente
        </h3>
        <p><strong>Nombre:</strong> ${orderData.user.name}</p>
        <p><strong>Email:</strong> ${orderData.user.email}</p>
        <p><strong>Teléfono:</strong> ${orderData.user.phone_number}</p>
        <p><strong>NIT/CI:</strong> ${orderData.user.nit_ci}</p>
        <p><strong>Razón Social:</strong> ${orderData.user.social_reason}</p>
      </div>
    </div>

    <h3 style="color: #334155; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#334155" stroke-width="2"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#334155" stroke-width="2"/>
        <line x1="12" y1="22.08" x2="12" y2="12" stroke="#334155" stroke-width="2"/>
      </svg>
      Detalle de Productos
    </h3>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align: center;">Cantidad</th>
          <th style="text-align: right;">Precio Unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total-section">
      <h2>Total: Bs. ${Number(orderData.total).toFixed(2)}</h2>
    </div>

    ${paymentStatus}

    <div class="footer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
        <polyline points="22 4 12 14.01 9 11.01" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p style="display: inline; margin-left: 5px;">Gracias por su compra</p>
      <p>Este es un recibo generado electrónicamente</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
