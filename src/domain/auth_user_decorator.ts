import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from './entities/user_entity';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserEntity;
  },
);
