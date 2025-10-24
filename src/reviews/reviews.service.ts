import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dtos/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    private readonly productService: ProductsService,
    private readonly userService: UsersService,
  ) {}

  public getReviews(
    productId: number,
    sort: 'ASC' | 'DESC' = 'DESC',
    page = 1,
    limit = 10,
  ) {
    return this.reviewRepo.find({
      where: productId ? { product: { id: productId } } : {},
      order: { createdAt: sort },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  public async addReview(userId: number, review: CreateReviewDto) {
    const user = await this.userService.getUserById(userId);
    const product = await this.productService.getProductById(review.productId);
    if (!user.data) throw new NotFoundException('User not found');
    if (!product) throw new NotFoundException('Product not found');
    const newReview = this.reviewRepo.create({
      ...review,
      user: user.data,
      product: product,
    });
    return this.reviewRepo.save(newReview);
  }

  public getReviewById(id: number) {
    return this.reviewRepo.findOne({ where: { id } });
  }
  public deleteReview(reviewId: number) {
    return this.reviewRepo.delete({ id: reviewId });
  }
}
