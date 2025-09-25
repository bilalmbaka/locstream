import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from 'src/domain/entities/user_entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTokenService } from 'src/core/services/token_service';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { AssetsService } from 'src/routes/assets/assets.service';
import { AssetsEntity } from 'src/domain/entities/assets_entity';
import { AuthService } from 'src/routes/auth/auth.service';
import { EmailService } from 'src/core/services/mail_service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, AccessTokenEntity, AssetsEntity])],
    controllers: [UsersController],
    providers: [UsersService, AuthTokenService, AssetsService, AuthService, EmailService],
    exports: [UsersService],
})
export class UsersModule {}
