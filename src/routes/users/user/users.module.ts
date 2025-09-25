import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from 'src/domain/entities/user_entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTokenService } from 'src/core/services/token_service';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, AccessTokenEntity])],
    controllers: [UsersController],
    providers: [UsersService, AuthTokenService],
    exports: [UsersService],
})
export class UsersModule {}
