import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CreateProductDto } from '../src/products/dtos/create-product.dto';
import { DataSource } from 'typeorm';
import { Product } from '../src/products/product.entity';
import { User } from '../src/users/user.entity';
import { UserType } from '../src/utils/enums';
import * as bcrypt from 'bcrypt';
import { App } from 'supertest/types';
import * as request from 'supertest';
import { UpdateProductDto } from '../src/products/dtos/update-product.dto';
import { plainToInstance } from 'class-transformer';

export const newProduct: CreateProductDto = {
  name: 'New Product',
  description: 'Description for New Product',
  price: 150,
};
//the entry point for e2e test is AppModule not the main.ts
describe('ProductsController(e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let productsToSave: CreateProductDto[];
  let accessToken: string;
  const httpServer = () => app.getHttpServer() as App;
  const req = () => request(httpServer());

  beforeEach(async () => {
    productsToSave = [
      {
        name: 'Product A',
        description: 'Description for Product A',
        price: 100,
      },
      {
        name: 'Product B',
        description: 'Description for Product B',
        price: 200,
      },
      {
        name: 'Product C',
        description: 'Description for Product C',
        price: 300,
      },
      {
        name: 'Product D',
        description: 'Description for Product D',
        price: 400,
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Do not need to handle dependencies
    }).compile();

    app = module.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('testpassword', salt);
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          username: 'testuser',
          password: hashedPassword,
          email: 'testuser@example.com',
          role: UserType.ADMIN,
          isVerified: true,
        },
      ])
      .execute();
    const loginResponse = await req().post('/users/login').send({
      password: 'testpassword',
      email: 'testuser@example.com',
    });
    accessToken = loginResponse.body.data;
  });
  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Product).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await app.close();
  });
  describe('/products (GET)', () => {
    beforeEach(
      async () =>
        await dataSource
          .createQueryBuilder()
          .insert()
          .into(Product)
          .values(productsToSave)
          .execute(),
    );
    it('should get all products without filters', async () => {
      const response = await req().get('/products');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(4);
    });
    it('should get all products with specific title', async () => {
      const response = await req().get('/products?name=Product A');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
    it('should get all products within range', async () => {
      const response = await req().get('/products?minPrice=200&maxPrice=300');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('/products (POST)', () => {
    it('should create a new product', async () => {
      const response = await req()
        .post('/products')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(newProduct);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newProduct);
    });
  });

  describe('/products/:id (GET)', () => {
    beforeEach(
      async () =>
        await dataSource
          .createQueryBuilder()
          .insert()
          .into(Product)
          .values(productsToSave)
          .execute(),
    );
    it('should get product by id if exists', async () => {
      const productId = +(await req().get('/products')).body[0].id;
      const response = await req().get(`/products/${productId}`);
      console.log(response);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: productId,
          name: expect.any(String),
        }),
      );
    });
    it('should return 404 if not exists', async () => {
      const products = (await req().get('/products')).body;
      const response = await req().get(`/products/${products.length * 5}`);
      expect(response.status).toBe(404);
    });
    it('should return 400 if invalid id passed', async () => {
      const response = await req().get(`/products/abxc`);
      expect(response.status).toBe(400);
    });
  });

  describe('/products/:id (PUT)', () => {
    it('should update the product if the id exists', async () => {
      const { body } = await req()
        .post('/products')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(newProduct);

      const updatedProduct = plainToInstance(UpdateProductDto, body, {
        excludeExtraneousValues: true,
      });
      console.log(updatedProduct);
      const response = await req()
        .put(`/products/${body.id}`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ ...updatedProduct, name: 'updatedName' });
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', body.id);
      expect(response.body).toHaveProperty('name', 'updatedName');
    });
  });

  describe('/products:/:id (DELETE)', () => {
    it('should delete the product if found', async () => {
      const { body } = await req()
        .post('/products')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(newProduct);

      const response = await req()
        .delete(`/products/${body.id}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
