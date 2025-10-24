import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Between, Like, Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable({})
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly userService: UsersService,
  ) {}

  public async getProducts(
    name?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<Product[]> {
    const filters = {
      ...(name ? { name: Like(`%${name}%`) } : {}),
      ...(minPrice && maxPrice ? { price: Between(minPrice, maxPrice) } : {}),
    };
    return await this.productRepository.find({
      where: filters,
    });
  }

  public async addProduct(
    userId: number,
    product: CreateProductDto,
  ): Promise<Product> {
    const user = await this.userService.getUserById(userId);
    const productWithUser = {
      ...product,
      title: product.name.toLowerCase(),
      user: user.data, //TypeORM will extract the id from this obj and put is in userId in product
    };
    const newProduct = this.productRepository.create(productWithUser);
    const response = await this.productRepository.save(newProduct);
    return response;
  }

  public async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product with given ID not found', {
        description: 'Please provide a valid product ID',
      });
    }
    return product;
  }

  public async updateProduct(
    id: number,
    product: UpdateProductDto,
  ): Promise<Product> {
    const updateResult = await this.productRepository.update({ id }, product);
    if (updateResult.affected === 0) {
      throw new NotFoundException('Product with given ID not found', {
        description: 'Please provide a valid product ID',
      });
    }
    return this.getProductById(id);
  }

  public async deleteProduct(id: number): Promise<boolean> {
    const deletedProduct = await this.productRepository.delete({ id });
    if (deletedProduct.affected === 0) {
      throw new NotFoundException('Product with given ID not found', {
        description: 'Please provide a valid product ID',
      });
    }
    return true;
  }
}
