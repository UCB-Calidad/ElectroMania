import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderStatusUseCase } from './update-order-status.use-case';
import { ConfirmPaymentForOrderUseCase } from './confirm-payment-for-order.use-case';
import { CancelOrderUseCase } from './cancel-order.use-case';
import { OrderGateway } from '../gateway/order.gateway';
import { OrderMapper } from '../mapper/order.mapper';
import { OrderStatus } from '../models/order-response.model';

describe("UpdateOrderStatusUseCase", () => {
    let updateOrderStatusUseCase: UpdateOrderStatusUseCase;
    let mockConfirmPayment: any;
    let mockCancelOrder: any;
    let mockOrderGateway: any;
    let mockOrderMapper: any;

    beforeEach(async () => {
        mockConfirmPayment = {
            execute: vi.fn().mockResolvedValue({}),
        };
        mockCancelOrder = {
            execute: vi.fn().mockResolvedValue({}),
        };
        mockOrderGateway = {
            emit: vi.fn(),
        };
        mockOrderMapper = {
            toResponseModel: vi.fn().mockReturnValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateOrderStatusUseCase,
                { provide: ConfirmPaymentForOrderUseCase, useValue: mockConfirmPayment },
                { provide: CancelOrderUseCase, useValue: mockCancelOrder },
                { provide: OrderGateway, useValue: mockOrderGateway },
                { provide: OrderMapper, useValue: mockOrderMapper },
            ]
        }).compile();
        updateOrderStatusUseCase = module.get<UpdateOrderStatusUseCase>(UpdateOrderStatusUseCase);
    });

    describe("execute", () => {
        it("Deberia confirmar pago para orden PAID", async () => {
            const result = await updateOrderStatusUseCase.execute(1, { status: OrderStatus.PAID } as any);
            expect(mockConfirmPayment.execute).toHaveBeenCalledWith(1);
        });

        it("Deberia cancelar orden para status CANCELED", async () => {
            const result = await updateOrderStatusUseCase.execute(1, { status: OrderStatus.CANCELED } as any);
            expect(mockCancelOrder.execute).toHaveBeenCalledWith(1);
        });
    });
});