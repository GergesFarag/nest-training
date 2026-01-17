import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('Before Route Handler');
    //* WILL RUN BEFORE ROUTE HANDLER
    return next.handle().pipe(
      map((response: { message: string; data: any }) => {
        const { data } = response;
        const { password, ...others } = data;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return { ...others };
      }),
    );
  }
}
