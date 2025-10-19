import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Review } from './review.model';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReviewsService {
  private reviews: Review[] = [
    {
      id: 1,
      productId: 1,
      userId: 1,
      content: 'Great product!',
      rate: 5,
      createdAt: new Date('22-11-2003'),
    },
    {
      id: 2,
      productId: 1,
      userId: 2,
      content: 'Good value for money.',
      rate: 4,
      createdAt: new Date('22-11-2003'),
    },
    {
      id: 3,
      productId: 2,
      userId: 3,
      content: 'Not as expected.',
      rate: 2,
      createdAt: new Date('22-11-2003'),
    },
    {
      id: 4,
      productId: 3,
      userId: 4,
      content: 'Excellent quality!',
      rate: 5,
      createdAt: new Date('22-11-2003'),
    },
    {
      id: 5,
      productId: 2,
      userId: 5,
      content: 'Would buy again.',
      rate: 4,
      createdAt: new Date('22-11-2003'),
    },
  ];
  constructor(){}
  public getReviews() {
    return this.reviews;
  }

  public addReview(review: CreateReviewDto) {
    const newReview: Review = {
      id: this.reviews.length + 1,
      ...review,
      createdAt: new Date(),
    };
    return this.reviews.push(newReview) > 0;
  }
  public getReviewById(id: number) {
    return this.reviews.find((review) => review.id === id);
  }
  public deleteReview(reviewId: number) {
    this.reviews = this.reviews.filter((review) => review.id !== reviewId);
    return this.reviews.length !== 0;
  }
}
