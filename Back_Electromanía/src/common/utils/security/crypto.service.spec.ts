import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CryptoService } from "./crypto.service";


describe("CryptoService",()=>{
    let cryptoService;
    beforeEach(async()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers:[CryptoService]
        }).compile();
        cryptoService = module.get<CryptoService>(CryptoService);
        vi.clearAllMocks();
    })
    describe("Generar un token",()=>{
        const numberOfBytes:number = 16;
        it("Deberia Generar un token en hexadecimal dando una cantidad de bytes",()=>{
            const token = cryptoService.generateToken(numberOfBytes);
            expect(token).toHaveLength(numberOfBytes*2);
        });
    });
    describe("Generar un Codigo Numerico de n dijitos",()=>{
        it("Deberia Generar un codigo numerico de 6 digitos",()=>{
            const code = cryptoService.generateNumericCode(6);
            expect(code).toBeGreaterThanOrEqual(100000);
            expect(code).toBeLessThanOrEqual(999999);
        })
    })
});