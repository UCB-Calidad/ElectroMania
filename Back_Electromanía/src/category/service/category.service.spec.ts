import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../prisma/service/prisma.service';
import { CategoryMapper } from '../mapper/category.mapper';
import { NotFoundException } from '@nestjs/common';

describe("CategoryService", () => {
    let categoryService: CategoryService;
    let mockPrismaService: any;
    let mockCategoryMapper: any;

    beforeEach(async () => {
        mockPrismaService = {
            category: {
                create: vi.fn().mockResolvedValue({ category_id: 1, category_name: "Test" }),
                findUnique: vi.fn().mockResolvedValue({ category_id: 1, category_name: "Test" }),
                findMany: vi.fn().mockResolvedValue([{ category_id: 1, category_name: "Test" }]),
                update: vi.fn().mockResolvedValue({}),
                delete: vi.fn().mockResolvedValue({}),
            }
        };
        mockCategoryMapper = {
            toEntity: vi.fn().mockReturnValue({}),
            toModel: vi.fn().mockReturnValue({ category_id: 1, category_name: "Test" }),
            toAddProduct: vi.fn().mockReturnValue({}),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: CategoryMapper, useValue: mockCategoryMapper },
            ]
        }).compile();
        categoryService = module.get<CategoryService>(CategoryService);
    });

    describe("create", () => {
        it("Deberia crear una categoria", async () => {
            const result = await categoryService.create({ category_name: "Test" } as any);
            expect(result).toBeDefined();
            expect(mockPrismaService.category.create).toHaveBeenCalled();
        });
    });

    describe("registerCategoryToProduct", () => {
        it("Deberia registrar una categoria a un producto", async () => {
            const result = await categoryService.registerCategoryToProduct({ productId: 1, categoryId: 1 });
            expect(result).toBeDefined();
        });

        it("Deberia throw NotFoundException si la categoria no existe", async () => {
            mockPrismaService.category.findUnique.mockResolvedValue(null);
            await expect(
                categoryService.registerCategoryToProduct({ productId: 1, categoryId: 999 })
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("update", () => {
        it("Deberia actualizar una categoria", async () => {
            const result = await categoryService.update(1, { category_name: "Updated" } as any);
            expect(result).toBeDefined();
            expect(mockPrismaService.category.update).toHaveBeenCalled();
        });
    });

    describe("register", () => {
        it("Deberia registrar una categoria", async () => {
            const result = await categoryService.register({ category_name: "Test" } as any);
            expect(result).toBeDefined();
        });
    });

    describe("findAll", () => {
        it("Deberia retornar todas las categorias", async () => {
            const result = await categoryService.findAll();
            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
        });

        it("Deberia throw NotFoundException si no hay categorias", async () => {
            mockPrismaService.category.findMany.mockResolvedValue([]);
            await expect(categoryService.findAll()).rejects.toThrow(NotFoundException);
        });
    });

    describe("findOne", () => {
        it("Deberia retornar una categoria por id", async () => {
            const result = categoryService.findOne(1);
            expect(result).toBeDefined();
        });
    });

    describe("remove", () => {
        it("Deberia eliminar una categoria", async () => {
            const result = categoryService.remove(1);
            expect(result).toBeDefined();
        });
    });
});