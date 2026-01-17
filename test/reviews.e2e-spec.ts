import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Review } from '../src/reviews/review.entity';
import * as bcrypt from 'bcrypt';
import { CreateReviewDto } from '../src/reviews/dtos/create-review.dto';
import { User } from '../src/users/user.entity';
import { UserType } from '../src/utils/enums';
import { Product } from '../src/products/product.entity';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let testUserId: number;
  let productIds: number[];

  const req = () => request(app.getHttpServer() as App);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);

    // Create a test user first
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('testpassword', salt);
    const userResult = await dataSource
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
    testUserId = userResult.identifiers[0].id;

    // create products before reviews (reviews reference products)
    const productResult = await dataSource
      .createQueryBuilder()
      .insert()
      .into(Product)
      .values([
        {
          name: 'Product 1',
          price: 10.0,
          description: 'Test product 1',
          userId: testUserId,
        },
        {
          name: 'Product 2',
          price: 20.0,
          description: 'Test product 2',
          userId: testUserId,
        },
        {
          name: 'Product 3',
          price: 30.0,
          description: 'Test product 3',
          userId: testUserId,
        },
        {
          name: 'Product 4',
          price: 40.0,
          description: 'Test product 4',
          userId: testUserId,
        },
      ])
      .execute();
    productIds = productResult.identifiers.map((p) => p.id);

    // create reviews using dynamic IDs
    const reviewsToBeCreated = [
      {
        comment: 'Great product, very useful!',
        rate: 5,
        productId: productIds[0],
        userId: testUserId,
      },
      {
        comment: 'Average quality, could be better.',
        rate: 3,
        productId: productIds[1],
        userId: testUserId,
      },
      {
        comment: 'Not satisfied with the purchase.',
        rate: 2,
        productId: productIds[1],
        userId: testUserId,
      },
      {
        comment: 'Excellent value for money!',
        rate: 4,
        productId: productIds[2],
        userId: testUserId,
      },
      {
        comment: 'Poor packaging, item arrived damaged.',
        rate: 1,
        productId: productIds[3],
        userId: testUserId,
      },
    ];
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(Review)
      .values(reviewsToBeCreated)
      .execute();

    const loginResponse = await req().post('/users/login').send({
      password: 'testpassword',
      email: 'testuser@example.com',
    });
    accessToken = loginResponse.body.data;
  });

  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Review).execute();
    await dataSource.createQueryBuilder().delete().from(Product).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await app.close();
  });

  describe('GET /reviews', () => {
    it('should return all reviews', async () => {
      const response = await req()
        .get('/reviews')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5); // 5 reviews created in beforeEach
    });

    it('should return reviews filtered by productId', async () => {
      const productIdToFilter = productIds[0]; // First product
      const response = await req()
        .get('/reviews')
        .query({ productId: productIdToFilter })
        .set('Authorization', `Bearer ${accessToken}`);
      console.log('Response body:', response.body);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1); // Only 1 review for first product
    });
  });
  describe('GET /reviews/:id', () => {
    it('should return single review by id', async () => {
      const reviews = await req()
        .get('/reviews')
        .set('Authorization', `Bearer ${accessToken}`);
      const createdReview = reviews.body[0];

      const response = await req()
        .get(`/reviews/${createdReview.id}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdReview.id);
    });
  });
  describe('POST /reviews', () => {
    it('should create a new review', async () => {
      const newReview: CreateReviewDto = {
        comment: 'This is a new review',
        rate: 4,
        productId: productIds[3], // Use dynamic product ID
      };
      const { body, status } = await req()
        .post('/reviews')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newReview);
      expect(status).toBe(201);
      expect(body).toMatchObject(newReview);
    });
  });
});
