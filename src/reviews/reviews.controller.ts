import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/utils/types';
import { CreateReviewResInterceptor } from './interceptors/create-review-res.interceptor';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @UseGuards(AuthGuard)
  @Get()
  public getReviews(
    @Query('productId', ParseIntPipe) productId: number,
    @Query('sort') sort: 'ASC' | 'DESC' = 'DESC',
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.reviewsService.getReviews(productId, sort, page, limit);
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  public getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getReviewById(id);
  }
  @UseGuards(AuthGuard)
  @UseInterceptors(CreateReviewResInterceptor)
  @Post()
  public addReview(
    @Body() review: CreateReviewDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.reviewsService.addReview(payload.id, review);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  public deleteReview(@Param('id', ParseIntPipe) reviewId: number) {
    return this.reviewsService.deleteReview(reviewId);
  }
}
