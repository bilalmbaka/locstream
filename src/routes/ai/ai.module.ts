import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AuthTokenService } from 'src/core/services/token_service';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([AccessTokenEntity])],
    controllers: [AiController],
    providers: [AiService, AuthTokenService],
})
export class AiModule {}
