import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WsException,
} from '@nestjs/websockets';
import { ShareLocationWebsocketGatewayService } from './share-location-websocket-gateway.service';
import { UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Constants } from 'src/core/constants/constants';
import { SocketGuard } from 'src/guards/socket_guard';
import { CleanData } from 'src/core/helpers/clean_data';
import { ConnectedUsersService } from '../user/connected_users_service';

@WebSocketGateway({ transports: ['websocket'], cors: { origin: '*' } }) // namespace: '/chat'
export class ShareLocationWebsocketGatewayGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly shareLocationWebsocketGatewayService: ShareLocationWebsocketGatewayService,
        private connectedUsersService: ConnectedUsersService,
    ) {}

    //Each time a user connects
    @UseGuards(SocketGuard)
    async handleConnection(@ConnectedSocket() client: Socket) {
        try {
            const token = client.handshake.headers['token'];
            if (!token) {
                client.disconnect();
                throw new WsException('Unauthorized');
            }

            const user = await this.shareLocationWebsocketGatewayService.fetchUserProfile(
                token as string,
            );

            console.log('user profile is', user);

            this.connectedUsersService.addUser(user.id, client);

            client.emit(
                Constants.locationSharers,
                user.sharedLocations.map((user) => CleanData.cleanUser(user)),
            );
        } catch (e) {
            console.log('Error connecting to socket', e);
            throw new WsException('Error connecting');
        }
    }

    handleDisconnect(client: Socket) {
        this.connectedUsersService.removeUser(client.id);
    }
}
