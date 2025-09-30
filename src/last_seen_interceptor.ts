import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserEntity } from './domain/entities/user_entity';

@Injectable()
export class LastSeenInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // 🔑 Do your logic here (e.g. update last_seen in DB)
        // If request.user is set by AuthGuard, you can use it
        if (request.user) {
            this.userRepository.update(request.user.id, {
                lastSeen: new Date(),
            });
        }

        return next.handle().pipe(
            tap(() => {
                console.log('last seen logged at', new Date().toISOString());
            }),
        );
    }
}
