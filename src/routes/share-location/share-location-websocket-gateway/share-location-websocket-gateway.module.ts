import { Module } from '@nestjs/common';
import { ShareLocationWebsocketGatewayService } from './share-location-websocket-gateway.service';
import { ShareLocationWebsocketGatewayGateway } from './share-location-websocket-gateway.gateway';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { UserEntity } from 'src/domain/entities/user_entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTokenService } from 'src/core/services/token_service';
import { ShareLocationService } from '../user/share-location.service';
import { UsersModule } from 'src/routes/users/user/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, AccessTokenEntity]), UsersModule],
    providers: [
        ShareLocationWebsocketGatewayGateway,
        ShareLocationWebsocketGatewayService,
        AuthTokenService,
        ShareLocationService,
    ],
    exports: [ShareLocationWebsocketGatewayGateway],
})
export class ShareLocationWebsocketGatewayModule {}
