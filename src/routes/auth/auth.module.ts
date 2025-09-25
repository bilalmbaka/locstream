import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/core/services/mail_service';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { AuthTokenService } from 'src/core/services/token_service';
import { UserEntity } from 'src/domain/entities/user_entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AccessTokenEntity])],
  controllers: [AuthController],
  providers: [AuthService, EmailService, AuthTokenService],
})
export class AuthModule {}
