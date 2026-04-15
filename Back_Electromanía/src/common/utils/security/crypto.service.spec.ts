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
});