import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateProductDto } from './dtos/create-product.dto';
import { JWTPayloadType } from '../utils/types';
import { UserType } from '../utils/enums';
import { UpdateProductDto } from './dtos/update-product.dto';
import { NotFoundError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;
  const mockUser: JWTPayloadType = {
    id: 1,
    userType: UserType.ADMIN,
  };
  const createProductDto: CreateProductDto = {
    name: 'samsung',
    description: 'fsdafsdf',
    price: 2000,
  };
  const mockProducts = [
    {
      id: 1,
      name: 'Iphone',
      description: 'this is iphone',
      price: 200,
    },
    {
      id: 2,
      name: 'Samsung',
      description: 'this is samsung',
      price: 200,
    },
    {
      id: 3,
      name: 'Nokia',
      description: 'this is nokia',
      price: 500,
    },
    {
      id: 4,
      name: 'Sony',
      description: 'this is sony',
      price: 600,
    },
    {
      id: 5,
      name: 'Sony',
      description: 'this is sony',
      price: 600,
    },
    {
      id: 6,
      name: 'Sony',
      description: 'this is sony',
      price: 600,
    },
  ];
  const mockProductsService = {
    getProducts: jest.fn(
      (title?: string, minPrice?: number, maxPrice?: number) => {
        let products = mockProducts;
        if (title) {
          products = [mockProducts[0], mockProducts[1]];
        }
        if (minPrice) {
          products = [mockProducts[2]];
        }
        if (maxPrice) {
          products = [mockProducts[2], mockProducts[3]];
        }
        return Promise.resolve(products);
      },
    ),
    deleteProduct: jest.fn(),
    updateProduct: jest.fn((id: number, update: UpdateProductDto) =>
      Promise.resolve({ ...mockProducts.find((p) => p.id === id), ...update }),
    ),
    getProductById: jest.fn((id: number) =>
      Promise.resolve(mockProducts.find((p) => p.id === id)),
    ),
    addProduct: jest.fn(),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should productsController be defined', () => {
    expect(productsController).toBeDefined();
  });

  it('should productsService be defined', () => {
    expect(productsService).toBeDefined();
  });

  describe('POST createProduct', () => {
    it('should call addProduct', async () => {
      await productsService.addProduct(mockUser.id, createProductDto);
      expect(mockProductsService.addProduct).toHaveBeenCalled();
      expect(mockProductsService.addProduct).toHaveBeenCalledTimes(1);
      expect(mockProductsService.addProduct).toHaveBeenCalledWith(
        mockUser.id,
        createProductDto,
      );
    });
  });

  describe('GET products', () => {
    it('should return products with no filteration', async () => {
      const products = await productsController.getProducts();
      expect(mockProductsService.getProducts).toHaveBeenCalledTimes(1);
      expect(mockProductsService.getProducts).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(products).toBe(mockProducts);
      expect(products).toHaveLength(6);
    });
    it('should return products[0] and products[1] if title exists', async () => {
      const products = await productsController.getProducts('moh');
      expect(mockProductsService.getProducts).toHaveBeenCalledTimes(1);
      expect(mockProductsService.getProducts).toHaveBeenCalledWith(
        'moh',
        undefined,
        undefined,
      );
      expect(products).toHaveLength(2);
    });
    it('should return products[2] and products[3] if min&max price exists', async () => {
      const products = await productsController.getProducts(undefined, 30, 50);
      expect(mockProductsService.getProducts).toHaveBeenCalledTimes(1);
      expect(mockProductsService.getProducts).toHaveBeenCalledWith(
        undefined,
        30,
        50,
      );
      expect(products).toHaveLength(2);
      expect(products).toEqual([mockProducts[2], mockProducts[3]]);
    });
  });

  describe('GET getProductById', () => {
    it('it should call the service and return the product', async () => {
      const product = await productsController.getProductById(1);
      expect(mockProductsService.getProductById).toHaveBeenCalledTimes(1);
      expect(mockProductsService.getProductById).toHaveBeenCalledWith(1);
      expect(product).toBeDefined();
      expect(product).toHaveProperty('id', 1);
      expect(product).toBeDefined();
    });
  });

  describe('PUT updateProduct', () => {
    const updateDto: UpdateProductDto = {
      name: 'updatedTitle',
    };
    it('should call updateProduct in service and update the product', async () => {
      const updatedOne = await productsController.updateProduct(1, updateDto);
      expect(mockProductsService.updateProduct).toHaveBeenCalledTimes(1);
      expect(mockProductsService.updateProduct).toHaveBeenCalledWith(
        1,
        updateDto,
      );
      expect(updatedOne).toBeDefined();
      expect(updatedOne.name).toMatch('updatedTitle');
    });
    it('should throw not found exception if not found product id', async () => {
      mockProductsService.updateProduct.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(
        productsController.updateProduct(1, updateDto),
      ).rejects.toThrow(NotFoundException);
      expect.assertions(1);
    });
  });

  describe('DELETE deleteProduct', () => {
    it('should delete the existed product', async () => {
      mockProductsService.deleteProduct.mockResolvedValue(true);
      const isDeleted = await productsController.deleteProduct(1);
      expect(isDeleted).toBeTruthy();
    });
    it('should throw not found if not exists', async () => {
      mockProductsService.deleteProduct.mockRejectedValue(
        new NotFoundException(),
      );
      await expect(productsController.deleteProduct(20)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
