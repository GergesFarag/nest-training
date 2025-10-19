import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Get()
  public getReviews() {
    return this.reviewsService.getReviews();
  }
  @Get(':id')
  public getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }
  @Post()
  public addReview(@Body(new ValidationPipe()) review: CreateReviewDto) {
    return this.reviewsService.addReview(review);
  }
  @Delete(':id')
  public deleteReview(@Param('id', ParseIntPipe) reviewId:number){
    return this.reviewsService.deleteReview(reviewId);
  }
}
