import type {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { OrderReceiptModel } from '../../../../order/models/order-response.model';
import { OrderItem } from '@prisma/client';

const receiptIcon =
  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L7 6H3C2.45 6 2 6.45 2 7v1c0 .55.45 1 1 1h1l2 11c.1.5.5.9 1 .9h10c.5 0 .9-.4 1-.9l2-11h1c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4l-2-4H9z" fill="#1e40af"/><circle cx="9" cy="21" r="1" fill="#1e40af"/><circle cx="17" cy="21" r="1" fill="#1e40af"/></svg>';

const calendarIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#334155" stroke-width="2"/><path d="M8 2v4M16 2v4M3 10h18" stroke="#334155" stroke-width="2"/></svg>';

const userIcon =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="#334155" stroke-width="2"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#334155" stroke-width="2"/></svg>';

const productsIcon =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#334155" stroke-width="2"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#334155" stroke-width="2"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="#334155" stroke-width="2"/></svg>';

const checkIcon =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/></svg>';

const styles: StyleDictionary = {
  header: {
    fontSize: 20,
    bold: true,
    alignment: 'center',
    color: '#1e40af',
    margin: [0, 0, 0, 5],
  },
  subheader: {
    fontSize: 12,
    alignment: 'center',
    color: '#64748b',
    margin: [0, 0, 0, 10],
  },
  sectionTitle: {
    fontSize: 12,
    bold: true,
    color: '#334155',
    margin: [0, 0, 0, 0],
  },
  infoLabel: {
    fontSize: 9,
    bold: true,
    color: '#334155',
  },
  infoValue: {
    fontSize: 9,
    color: '#64748b',
  },
  tableHeader: {
    fontSize: 10,
    bold: true,
    fillColor: '#2563eb',
    color: '#ffffff',
    margin: [5, 5, 5, 5],
  },
  tableCell: {
    fontSize: 9,
    margin: [5, 5, 5, 5],
  },
  total: {
    fontSize: 16,
    bold: true,
    color: '#1e40af',
    alignment: 'right',
    margin: [0, 10, 0, 0],
  },
  statusBadge: {
    fontSize: 10,
    bold: true,
    alignment: 'center',
    margin: [0, 5, 0, 0],
  },
  footer: {
    fontSize: 8,
    alignment: 'center',
    color: '#64748b',
    margin: [0, 20, 0, 0],
  },
  paymentInfo: {
    fontSize: 9,
    margin: [0, 3, 0, 3],
  },
};

export class BillReport {
  getDefinition(orderData: OrderReceiptModel): TDocumentDefinitions {
    return {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60],
      styles: styles,
      content: [
        // HEADER
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              stack: [
                { svg: receiptIcon, alignment: 'center' },
                { text: 'RECIBO DE COMPRA', style: 'header' },
                { text: `Orden #${orderData.order_id}`, style: 'subheader' },
                {
                  text: orderData.status.translate,
                  style: 'statusBadge',
                  color:
                    orderData.status.value === 'PAID' ? '#065f46' : '#92400e',
                  background:
                    orderData.status.value === 'PAID' ? '#d1fae5' : '#fef3c7',
                },
              ],
            },
            { width: '*', text: '' },
          ],
          margin: [0, 0, 0, 20],
        },

        // INFO ORDEN + CLIENTE
        {
          columns: [
            {
              width: '48%',
              stack: [
                {
                  columns: [
                    {
                      svg: calendarIcon,
                      width: 18,
                      height: 18,
                      margin: [0, 2, 6, 0],
                    },
                    {
                      text: 'Información de la Orden',
                      style: 'sectionTitle',
                      marginTop: 4,
                    },
                  ],
                },
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 230,
                      h: 60,
                      r: 3,
                      color: '#f8fafc',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: [
                        { text: 'Fecha: ', style: 'infoLabel' },
                        {
                          text: new Date(orderData.created_at).toLocaleString(
                            'es-BO',
                            { dateStyle: 'full', timeStyle: 'short' },
                          ),
                          style: 'infoValue',
                        },
                      ],
                      margin: [5, -55, 0, 3],
                    },
                    {
                      text: [
                        { text: 'Estado: ', style: 'infoLabel' },
                        {
                          text: orderData.status.translate,
                          style: 'infoValue',
                        },
                      ],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                },
              ],
            },

            { width: '4%', text: '' },

            {
              width: '48%',
              stack: [
                {
                  columns: [
                    {
                      svg: userIcon,
                      width: 18,
                      height: 18,
                      margin: [0, 2, 6, 0],
                    },
                    {
                      text: 'Información del Cliente',
                      style: 'sectionTitle',
                      marginTop: 4,
                    },
                  ],
                },
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 230,
                      h: 80,
                      r: 3,
                      color: '#f8fafc',
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: [
                        { text: 'Nombre: ', style: 'infoLabel' },
                        { text: orderData.user.name, style: 'infoValue' },
                      ],
                      margin: [5, -75, 0, 3],
                    },
                    {
                      text: [
                        { text: 'Email: ', style: 'infoLabel' },
                        { text: orderData.user.email, style: 'infoValue' },
                      ],
                      margin: [5, 0, 0, 3],
                    },
                    {
                      text: [
                        { text: 'Teléfono: ', style: 'infoLabel' },
                        {
                          text: orderData.user.phone_number,
                          style: 'infoValue',
                        },
                      ],
                      margin: [5, 0, 0, 3],
                    },
                    {
                      text: [
                        { text: 'NIT/CI: ', style: 'infoLabel' },
                        { text: orderData.user.nit_ci, style: 'infoValue' },
                      ],
                      margin: [5, 0, 0, 3],
                    },
                    {
                      text: [
                        { text: 'Razón Social: ', style: 'infoLabel' },
                        {
                          text: orderData.user.social_reason,
                          style: 'infoValue',
                        },
                      ],
                      margin: [5, 0, 0, 0],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // PRODUCTOS
        {
          columns: [
            { svg: productsIcon, width: 20, height: 20, margin: [0, 2, 6, 0] },
            {
              text: 'Detalle de Productos',
              style: 'sectionTitle',
              marginTop: 6,
            },
          ],
          margin: [0, 15, 0, 5],
        },

        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Producto', style: 'tableHeader' },
                { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
                {
                  text: 'Precio Unit.',
                  style: 'tableHeader',
                  alignment: 'right',
                },
                { text: 'Total', style: 'tableHeader', alignment: 'right' },
              ],
              ...this.getProducts(orderData),
            ],
          },
          layout: {
            hLineWidth: (i: number, node: any) =>
              i === 0 || i === 1 || i === node.table.body.length ? 0 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#e5e7eb',
          },
        },

        {
          text: `Total: Bs. ${Number(orderData.total).toFixed(2)}`,
          style: 'total',
        },

        // PAGO
        ...this.getPayment(orderData),

        // FOOTER
        {
          svg: checkIcon,
          width: 14,
          height: 14,
          margin: [6, 2, 6, 0],
          alignment: 'center',
        },
        { text: 'Gracias por su compra', style: 'footer', alignment: 'center' },
        {
          text: 'Este es un recibo generado electrónicamente',
          style: 'footer',
        },
      ],
    };
  }

  private getProducts(orderData: OrderReceiptModel): any[][] {
    return orderData.orderItems.map((item: OrderItem) => [
      { text: item.product_name, style: 'tableCell' },
      {
        text: item.quantity.toString(),
        style: 'tableCell',
        alignment: 'center',
      },
      {
        text: `Bs. ${Number(item.unit_price).toFixed(2)}`,
        style: 'tableCell',
        alignment: 'right',
      },
      {
        text: `Bs. ${Number(item.total).toFixed(2)}`,
        style: 'tableCell',
        alignment: 'right',
      },
    ]);
  }

  private getPayment(orderData: OrderReceiptModel): Content[] {
    if (!orderData.payment) {
      return [
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 515,
              h: 40,
              r: 5,
              color: '#fef2f2',
            },
          ],
          margin: [0, 15, 0, 0],
        },
        {
          text: 'Pago Pendiente',
          bold: true,
          color: '#dc2626',
          fontSize: 11,
          margin: [10, -30, 0, 0],
        },
      ];
    }

    return [
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: 515,
            h: 70,
            r: 5,
            color: '#f0f9ff',
          },
        ],
        margin: [0, 15, 0, 0],
      },
      {
        stack: [
          {
            text: 'Información de Pago',
            bold: true,
            color: '#0369a1',
            fontSize: 11,
            margin: [10, -60, 0, 5],
          },
          {
            text: [
              { text: 'Método: ', bold: true },
              { text: orderData.payment.method.translate },
            ],
            style: 'paymentInfo',
            margin: [10, 0, 0, 0],
          },
          {
            text: [
              { text: 'Estado: ', bold: true },
              { text: orderData.payment.status.translate },
            ],
            style: 'paymentInfo',
            margin: [10, 0, 0, 0],
          },
          {
            text: [
              { text: 'Monto: ', bold: true },
              { text: `Bs. ${Number(orderData.payment.amount).toFixed(2)}` },
            ],
            style: 'paymentInfo',
            margin: [10, 0, 0, 0],
          },
        ],
      },
    ];
  }
}
