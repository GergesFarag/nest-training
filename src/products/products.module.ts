import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), UsersModule  , JwtModule], //* Import the Product entity here
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [],
})
export class ProductsModule {
  constructor() {}
}
