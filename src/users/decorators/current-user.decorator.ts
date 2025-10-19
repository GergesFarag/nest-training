import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

export const CurrentUser = createParamDecorator((_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const payload : JWTPayloadType = req[CURRENT_USER_KEY];
    return payload; 
});

