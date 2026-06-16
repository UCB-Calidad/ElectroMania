import { PrismaService } from './../../prisma/service/prisma.service';
import { beforeEach, describe, expect, it } from "vitest";
import { prismaMock } from "test-utils/prisma-mock";
import { PaymentService } from "./payment.service";
import { Payment } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { PaymentMethod, PaymentStatus } from '../dto/register-payment.dto';
import { Test, TestingModule } from '@nestjs/testing';

describe("Payment Service",()=>{
    let paymentService: PaymentService;
    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();
        paymentService = module.get<PaymentService>(PaymentService);
    })
    describe("Registro de venta",()=>{
        it("Deberia registrar una venta",async()=>{
            const orderId = 1;
            const dto = {
                amount: 100,
                method: "credit_card",
                status: "completed",
            };
            const expectedPayment: Payment = {
                payment_id: 1,
                amount:  new Decimal(100),
                method: PaymentMethod.CASH,
                status: PaymentStatus.PAID,
                order_id: orderId,
                created_at: new Date()
            };
            prismaMock.payment.create.mockResolvedValue(expectedPayment);
            const result = await paymentService.registerPayment(orderId, dto);
            expect(result).toEqual(expectedPayment);
            expect(prismaMock.payment.create).toHaveBeenCalledWith({
                data: {
                    amount: dto.amount,
                    method: dto.method,
                    status: dto.status,
                    order: {
                        connect: {
                            order_id: orderId,
                        },
                    },
                },
            });
        })
    })
})