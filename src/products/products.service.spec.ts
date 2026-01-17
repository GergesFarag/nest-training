import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dtos/update-product.dto';

type Options = {
  where: { name?: string; minPrice?: number; maxPrice?: number };
};

describe('ProductsService', () => {
  let productService: ProductsService;
  let productRepository: Repository<Product>;
  const REPO_TOKEN = getRepositoryToken(Product);
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
  ];
  const mockUserService = {
    getUserById: jest.fn((userId: number) =>
      Promise.resolve({ data: { id: userId } }),
    ),
  };
  const mockProductRepo = {
    create: jest.fn(
      (createProductDto: CreateProductDto & { user: number }) =>
        createProductDto,
    ),
    save: jest.fn((createProductDto: CreateProductDto & { user: number }) =>
      Promise.resolve({ ...createProductDto, id: 1 }),
    ),
    find: jest.fn(
      (options?: {
        where: {
          name?: { _value: string };
          price?: { _value: [number, number] };
        };
      }) => {
        let products: typeof mockProducts = mockProducts;
        if (options?.where.name?._value) {
          products = products.filter((p) =>
            p.name.includes(options.where.name!._value),
          );
        }
        if (options?.where.price?._value) {
          const [minPrice, maxPrice] = options.where.price._value;
          products = products.filter(
            (p) => p.price >= minPrice && p.price <= maxPrice,
          );
        }
        return Promise.resolve(products);
      },
    ),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(() => Promise.resolve({ affected: 1 })),
  };

  const createProductDto: CreateProductDto = {
    name: 'Iphone',
    description: 'this is iphone',
    price: 2000,
  };
  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: REPO_TOKEN,
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    productService = module.get<ProductsService>(ProductsService);

    productRepository = module.get<Repository<Product>>(REPO_TOKEN);
  });

  it('should product service to be defined', () => {
    expect(productService).toBeDefined();
  });

  it('should product repository to be defined', () => {
    expect(productRepository).toBeDefined();
  });

  describe('createProduct', () => {
    it('should call create method', async () => {
      await productService.addProduct(1, createProductDto);

      expect(mockProductRepo.create).toHaveBeenCalled();
      expect(mockProductRepo.create).toHaveBeenCalledTimes(1);
      expect(mockProductRepo.create).toHaveBeenCalledWith({
        ...createProductDto,
        title: createProductDto.name.toLowerCase(),
        user: { id: 1 },
      });
    });

    it('should call save method', async () => {
      await productService.addProduct(1, createProductDto);

      expect(productRepository.save).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledTimes(1);
      expect(productRepository.save).toHaveBeenCalledWith({
        ...createProductDto,
        title: createProductDto.name.toLowerCase(),
        user: { id: 1 },
      });
    });

    it('should create the product', async () => {
      const product = await productService.addProduct(1, createProductDto);
      expect(product).toBeDefined();
      expect(product).toMatchObject({ ...createProductDto, id: 1 });
    });
  });

  describe('getAllProducts', () => {
    it('should call find method', async () => {
      await productService.getProducts();
      expect(mockProductRepo.find).toHaveBeenCalled();
      expect(mockProductRepo.find).toHaveBeenCalledTimes(1);
    });

    it('should return products', async () => {
      const products = await productService.getProducts();
      expect(products).toBeDefined();
      expect(products.length).not.toBe(0);
      expect(products).toEqual(mockProducts);
    });

    it('should return product with minPrice = 200 and max = 500', async () => {
      const products = await productService.getProducts(undefined, 200, 500);
      expect(products).toBeDefined();
      expect(products.length).toBe(3);
    });
  });

  describe('getProductById', () => {
    const product = {
      id: 12,
      name: 'Iphone',
      description: 'this is iphone',
      price: 2000,
    };
    it('should call findOne', async () => {
      mockProductRepo.findOne.mockResolvedValue(product);
      await productService.getProductById(product.id);
      expect(mockProductRepo.findOne).toHaveBeenCalled();
      expect(mockProductRepo.findOne).toHaveBeenCalledTimes(1);
      expect(mockProductRepo.findOne).toHaveBeenCalledWith({
        where: { id: product.id },
      });
    });
    it('should call get the product by id', async () => {
      mockProductRepo.findOne.mockResolvedValue(product);
      const foundProduct = await productService.getProductById(product.id);
      expect(foundProduct).toBeDefined();
      expect(foundProduct).toMatchObject(product);
    });

    it('should throw not found exception if the product does not exist ', async () => {
      mockProductRepo.findOne.mockRejectedValue(new NotFoundException());
      await expect(productService.getProductById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProduct', () => {
    it('should update the product', async () => {
      mockProductRepo.update.mockResolvedValue({
        affected: 1,
      });
      mockProductRepo.findOne.mockResolvedValue({
        ...mockProducts[0],
        name: 'updated name',
      });

      const response = await productService.updateProduct(1, {
        name: 'updated name',
      });

      expect(mockProductRepo.update).toHaveBeenCalledTimes(1);
      expect(mockProductRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        {
          name: 'updated name',
        },
      );
      expect(response).toMatchObject({
        id: 1,
        name: 'updated name',
        description: 'this is iphone',
        price: 200,
      });
    });
    it('should throw not found if product does not found', async () => {
      mockProductRepo.update.mockRejectedValue(new NotFoundException());

      await expect(
        productService.updateProduct(15, { name: 'title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete product', () => {
    it('should call delete method', async () => {
      await productService.deleteProduct(1);
      expect(mockProductRepo.delete).toHaveBeenCalledTimes(1);
      expect(mockProductRepo.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should delete the product', async () => {
      const isDeleted = await productService.deleteProduct(1);
      expect(isDeleted).toBeTruthy();
    });

    it('should throw not found exception if the product does not found', async () => {
      mockProductRepo.delete.mockRejectedValue(new NotFoundException());
      expect.assertions(1);
      await expect(productService.deleteProduct(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
