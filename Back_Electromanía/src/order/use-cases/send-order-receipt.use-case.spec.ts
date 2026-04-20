import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { SendOrderReceiptUseCase } from './send-order-receipt.use-case';
import { OrderService } from '../service/order.service';
import { OrderReceiptService } from '../service/order-receipt-html.service';
import { MailService } from '../../mail/service/mail.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { PdfMakeService } from '../../common/utils/pdf/pdf-make.maker';

describe("SendOrderReceiptUseCase", () => {
    let sendOrderReceiptUseCase: SendOrderReceiptUseCase;
    let mockOrderService: any;
    let mockReceiptService: any;
    let mockMailService: any;
    let mockPdfMaker: any;
    let mockPrismaService: any;

    beforeEach(async () => {
        mockOrderService = {
            getOrderForXML: vi.fn().mockResolvedValue({ 
                order_id: 1, 
                user: { email: "test@test.com" }
            }),
        };
        mockReceiptService = {
            generateReceiptHtml: vi.fn().mockReturnValue("<html>receipt</html>"),
        };
        mockMailService = {
            sendOrderReceipt: vi.fn().mockResolvedValue({}),
            sendOrderReceiptHtml: vi.fn().mockResolvedValue({}),
        };
        mockPdfMaker = {
            generatePDF: vi.fn().mockResolvedValue(Buffer.from("pdf")),
        };
        mockPrismaService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SendOrderReceiptUseCase,
                { provide: OrderService, useValue: mockOrderService },
                { provide: OrderReceiptService, useValue: mockReceiptService },
                { provide: MailService, useValue: mockMailService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: PdfMakeService, useValue: mockPdfMaker },
            ]
        }).compile();
        sendOrderReceiptUseCase = module.get<SendOrderReceiptUseCase>(SendOrderReceiptUseCase);
    });

    describe("execute", () => {
        it("Deberia enviar el recibo con PDF", async () => {
            const result = await sendOrderReceiptUseCase.execute(1, true);
            expect(result).toBeDefined();
            expect(result.message).toBe("Receipt sent successfully");
            expect(mockMailService.sendOrderReceipt).toHaveBeenCalled();
        });

        it("Deberia enviar el recibo solo con HTML", async () => {
            const result = await sendOrderReceiptUseCase.execute(1, false);
            expect(result).toBeDefined();
            expect(result.message).toBe("Receipt sent successfully");
            expect(mockMailService.sendOrderReceiptHtml).toHaveBeenCalled();
        });
    });
});