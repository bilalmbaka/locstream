import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class SocketGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        console.log('in here buyy');

        const client: Socket = context.switchToWs().getClient();

        const token = client.handshake.auth?.token;
        if (!token || token !== 'secret') {
            throw new WsException('Unauthorized');
        }

        return true;
    }
}
