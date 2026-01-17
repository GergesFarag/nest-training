import { Product } from '../src/products/product.entity';
import { Review } from '../src/reviews/review.entity';
import { User } from '../src/users/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config({
  path: '.env',
});
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DB_URL,
  synchronize: true,
  logging: false,
  entities: [User, Product, Review],
  migrations: ['dist/db/migrations/*.js'],
};

export const dataSource = new DataSource(dataSourceOptions);
