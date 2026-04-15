import { MailerService } from "@nestjs-modules/mailer";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { MailService } from "./mail.service";

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
    });
});