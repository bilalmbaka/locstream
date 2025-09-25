import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { Repository } from 'typeorm';
import { AuthTokenService } from 'src/core/services/token_service';

import { TokenExpiredError } from 'jsonwebtoken';
import { UserRole } from 'src/core/constants/enums';

@Injectable()
export class PriviledgedUserGuard implements CanActivate {
    constructor(
        @InjectRepository(AccessTokenEntity)
        private accessTokenRepository: Repository<AccessTokenEntity>,

        private authTokenService: AuthTokenService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('Missing or invalid authorization header');
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix

            const decoded = this.authTokenService.decode(token);

            if (this.authTokenService.hasExpired(token)) {
                throw new ForbiddenException();
            }

            //Fetch the user information.

            const authenticatedUser = await this.accessTokenRepository.findOne({
                relations: {
                    user: true,
                },
                where: {
                    accessToken: token,
                },
                order: {},
            });

            if (!authenticatedUser || authenticatedUser.user.emailVerified == false) {
                throw new ForbiddenException();
            }

            request.user = authenticatedUser.user;

            if (authenticatedUser.user.role == UserRole.user) {
                throw new UnauthorizedException('Only priviledged users can access this route');
            }

            return true;
        } catch (e) {
            console.log('Error in auth guard', e);

            if (e instanceof TokenExpiredError) {
                throw new ForbiddenException();
            }

            throw e;
        }
    }
}
