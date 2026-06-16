import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmPaymentForOrderUseCase } from './confirm-payment-for-order.use-case';
import { PrismaService } from '../../prisma/service/prisma.service';
import { CartService } from '../../cart/service/cart.service';
import { OrderService } from '../service/order.service';
import { ProductService } from '../../product/service/product.service';
import { PaymentService } from '../../payment/service/payment.service';
import { SendOrderReceiptUseCase } from './send-order-receipt.use-case';
import { GenerateOrderXmlUseCase } from './generate-order-xml.usecase';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';
import { NotFoundException } from '@nestjs/common';

describe("ConfirmPaymentForOrderUseCase", () => {
    let confirmPaymentForOrderUseCase: ConfirmPaymentForOrderUseCase;
    let mockPrismaService: any;
    let mockCartService: any;
    let mockOrderService: any;
    let mockProductService: any;
    let mockPaymentService: any;
    let mockSendOrderReceipt: any;
    let mockGenerateHtml: any;
    let mockOrderGateway: any;
    let mockOrderMapper: any;

    beforeEach(async () => {
        mockPrismaService = {
            $transaction: vi.fn((callback) => callback({})),
        };
        mockCartService = {
            updateCart: vi.fn().mockResolvedValue({}),
        };
        mockOrderService = {
            getById: vi.fn().mockResolvedValue({ 
                order_id: 1, 
                status: "PENDING",
                total: 100,
                cart: { id: 1, details: [] }
            }),
            update: vi.fn().mockResolvedValue({}),
            clearCachedOrderById: vi.fn(),
        };
        mockProductService = {
            confirmSale: vi.fn().mockResolvedValue({}),
        };
        mockPaymentService = {
            registerPayment: vi.fn().mockResolvedValue({}),
        };
        mockSendOrderReceipt = {
            execute: vi.fn().mockResolvedValue({}),
        };
        mockGenerateHtml = {
            execute: vi.fn().mockResolvedValue({ html: "<html>test</html>" }),
        };
        mockOrderGateway = {
            emitOrderUpdated: vi.fn(),
        };
        mockOrderMapper = {
            toOrderUpdatedEventDto: vi.fn().mockReturnValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfirmPaymentForOrderUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: CartService, useValue: mockCartService },
                { provide: OrderService, useValue: mockOrderService },
                { provide: ProductService, useValue: mockProductService },
                { provide: PaymentService, useValue: mockPaymentService },
                { provide: SendOrderReceiptUseCase, useValue: mockSendOrderReceipt },
                { provide: GenerateOrderXmlUseCase, useValue: mockGenerateHtml },
                { provide: OrderGateway, useValue: mockOrderGateway },
                { provide: OrderMapper, useValue: mockOrderMapper },
            ]
        }).compile();
        confirmPaymentForOrderUseCase = module.get<ConfirmPaymentForOrderUseCase>(ConfirmPaymentForOrderUseCase);
    });

    describe("execute", () => {
        it("Deberia confirmar el pago de una orden", async () => {
            const result = await confirmPaymentForOrderUseCase.execute(1);
            expect(result).toBeDefined();
            expect(mockOrderService.getById).toHaveBeenCalledWith(1);
        });

        it("Deberia throw NotFoundException si la orden no existe", async () => {
            mockOrderService.getById.mockResolvedValue(null);
            await expect(confirmPaymentForOrderUseCase.execute(999)).rejects.toThrow(NotFoundException);
        });
    });
});