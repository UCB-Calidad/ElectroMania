import { MailerService } from "@nestjs-modules/mailer";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { MailService } from "./mail.service";
import { Email } from '../../../../.kilo/worktrees/ginger-sternum/Back_Electromanía/src/auth/models/value objects/email';

describe("MailService", () => {
    let mailService: MailService;
    let mailerServiceMock: DeepMockProxy<MailerService>;

    beforeEach(async () => {
        mailerServiceMock = mockDeep<MailerService>();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: MailerService,
                    useValue: mailerServiceMock
                }
            ]
        }).compile();
        mailService = module.get<MailService>(MailService);
        vi.clearAllMocks();
    });
    describe("Conexion SMTP", () => {
        it("Deberia verificar la conexion SMTP al iniciar el modulo", async () => {
            const loggerLogSpy = vi.spyOn(mailService['logger'], 'log').mockImplementation(() => {});
            await mailService.onModuleInit();
            expect(loggerLogSpy).toHaveBeenCalledWith('SMTP connection verified successfully ✅');
        });
        it("Deberia mostrar un log de error si la conexion SMTP falla", async () => {
            const errorMessage = "Error de conexión SMTP";
            mailerServiceMock['transporter'].verify.mockRejectedValueOnce(new Error(errorMessage));
            const loggerErrorSpy = vi.spyOn(mailService['logger'], 'error').mockImplementation(() => {});
            await mailService.onModuleInit();
            expect(loggerErrorSpy).toHaveBeenCalledWith('SMTP verification failed ❌', new Error(errorMessage));
        });
    });

    describe("Mandar orden por email", () => {
        it("Deberia mostrar un log de error y lanzar una excepción en caso de fallar el envio", async () => {
            const errorMessage = "Error de conexión SMTP";
            mailerServiceMock.sendMail.mockRejectedValueOnce(new Error(errorMessage));
            const loggerErrorSpy = vi.spyOn(mailService['logger'], 'error').mockImplementation(() => {});
            const to = "cliente@correo.com";
            const orderNumber = 123;
            const pdfBuffer = Buffer.from("pdf-falso");
            const htmlContent = "<p>Html Falso</p>";
            await expect(
                mailService.sendOrderReceipt(to, orderNumber, pdfBuffer, htmlContent)
            ).rejects.toThrow(errorMessage);
            expect(loggerErrorSpy).toHaveBeenCalledWith(`Error sending receipt email: ${errorMessage}`);
            expect(mailerServiceMock.sendMail).toHaveBeenCalledOnce();
        });
        it("Deberia mandar un email con el recibo de la orden",async()=>{
            const to = "cliente@correo.com";
            const orderNumber = 123;
            const pdfBuffer = Buffer.from("pdf-falso");
            const htmlContent = "<p>Html Falso</p>";
            const loggerLogSpy = vi.spyOn(mailService['logger'], 'log').mockImplementation(() => {});
            await mailService.sendOrderReceipt(to, orderNumber, pdfBuffer, htmlContent);
            expect(loggerLogSpy).toHaveBeenCalledWith(`Receipt email sent successfully to ${to} for order #${orderNumber}`);
            expect(mailerServiceMock.sendMail).toHaveBeenCalledOnce();
        });
    });
    describe("Mandar orden por email en formato HTML", () => {
        it("Deberia mandar una exception en caso de fallar el envio", async () => {
            const errorMessage = "Error de conexión SMTP";
            mailerServiceMock.sendMail.mockRejectedValueOnce(new Error(errorMessage));
            const loggerErrorSpy = vi.spyOn(mailService['logger'], 'error').mockImplementation(() => {});
            const to = "cliente@correo.com";
            const orderNumber = 123;
            const htmlContent = "<p>Html Falso</p>";
            await expect(
                mailService.sendOrderReceiptHtml(to, orderNumber, htmlContent)
            ).rejects.toThrow(errorMessage);
            expect(loggerErrorSpy).toHaveBeenCalledWith(`Error sending HTML receipt: ${errorMessage}`);
            expect(mailerServiceMock.sendMail).toHaveBeenCalledOnce();
        });
        it("Deberia mandar un email con el recibo de la orden en formato HTML",async()=>{
            const to = "cliente@correo.com";
            const orderNumber = 123;
            const htmlContent = "<p>Html Falso</p>";
            const loggerLogSpy = vi.spyOn(mailService['logger'], 'log').mockImplementation(() => {});
            await mailService.sendOrderReceiptHtml(to, orderNumber, htmlContent);
            expect(mailerServiceMock.sendMail).toHaveBeenCalledOnce();
            expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
                to,
                subject: `Recibo de Compra - Orden #${orderNumber}`,
                html: htmlContent,
            });
        });
    })
});