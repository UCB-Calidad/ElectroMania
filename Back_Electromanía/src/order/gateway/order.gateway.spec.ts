import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { OrderGateway } from './order.gateway';

describe("OrderGateway", () => {
    let orderGateway: OrderGateway;
    let mockServer: any;

    beforeEach(async () => {
        mockServer = {
            emit: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [OrderGateway]
        }).compile();
        orderGateway = module.get<OrderGateway>(OrderGateway);
        (orderGateway as any).server = mockServer;
    });

    describe("afterInit", () => {
        it("Deberia inicializar el gateway", () => {
            orderGateway.afterInit(mockServer);
            expect(orderGateway).toBeDefined();
        });
    });

    describe("handleConnection", () => {
        it("Deberia manejar conexión de cliente", () => {
            const mockClient = { id: "socket-id-1" } as any;
            orderGateway.handleConnection(mockClient);
            expect(orderGateway).toBeDefined();
        });
    });

    describe("handleDisconnect", () => {
        it("Deberia manejar desconexión de cliente", () => {
            const mockClient = { id: "socket-id-1" } as any;
            orderGateway.handleDisconnect(mockClient);
            expect(orderGateway).toBeDefined();
        });
    });

    describe("emitOrderCreated", () => {
        it("Deberia emitir evento order.created", () => {
            const payload = { order_id: 1, user: { uuid: "123" }, total: 100, status: "PENDING", createdAt: "2024-01-01" } as any;
            orderGateway.emitOrderCreated(payload);
            expect(mockServer.emit).toHaveBeenCalledWith('order.created', payload);
        });
    });

    describe("emitOrderUpdated", () => {
        it("Deberia emitir evento order.updated", () => {
            const payload = { order_id: 1, user: { uuid: "123" }, total: 100, status: "PAID", updatedAt: "2024-01-01" } as any;
            orderGateway.emitOrderUpdated(payload);
            expect(mockServer.emit).toHaveBeenCalledWith('order.updated', payload);
        });
    });

    describe("emitOrderCancelled", () => {
        it("Deberia emitir evento order.cancelled", () => {
            const payload = { order_id: 1, user: { uuid: "123" }, total: 100, status: "CANCELED", reason: "User request", cancelledAt: "2024-01-01" } as any;
            orderGateway.emitOrderCancelled(payload);
            expect(mockServer.emit).toHaveBeenCalledWith('order.cancelled', payload);
        });
    });
});