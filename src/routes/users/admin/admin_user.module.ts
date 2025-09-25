import { Module } from '@nestjs/common';
import { AdminUserService } from './admin_user.service';
import { PriviledgeUserController } from './admin_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/domain/entities/user_entity';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { AuthTokenService } from 'src/core/services/token_service';
import { UsersModule } from '../user/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, AccessTokenEntity]), UsersModule],
    controllers: [PriviledgeUserController],
    providers: [AdminUserService, AuthTokenService],
})
export class PriviledgeUserModule {}
