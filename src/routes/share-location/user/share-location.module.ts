import { Module } from '@nestjs/common';
import { ShareLocationService } from './share-location.service';
import { ShareLocationController } from './share-location.controller';
import { UserEntity } from 'src/domain/entities/user_entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { AuthTokenService } from 'src/core/services/token_service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, AccessTokenEntity])],
    controllers: [ShareLocationController],
    providers: [ShareLocationService, AuthTokenService],
})
export class ShareLocationModule {}
