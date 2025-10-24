import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Review } from '../review.entity';

@Injectable()
export class CreateReviewResInterceptor implements NestInterceptor {
  intercept(
    _: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((response: Review) => {
        const { user, product, ...others } = response;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...others };
      }),
    );
  }
}
