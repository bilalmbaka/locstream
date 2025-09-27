// connected-users.service.ts
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ConnectedUsersService {
    private connectedUsers: { userId: string; socket: Socket }[] = [];

    addUser(userId: string, socket: Socket) {
        this.connectedUsers.push({ userId, socket });
    }

    removeUser(socketId: string) {
        this.connectedUsers = this.connectedUsers.filter((u) => u.socket.id !== socketId);
    }

    getUsers(): { userId: string; socket: Socket }[] {
        return this.connectedUsers;
    }

    getUserSockets(userId: string): Socket[] {
        console.log('connection is', this.connectedUsers);
        const sockets = this.connectedUsers.filter((u) => u.userId === userId).map((u) => u.socket);

        return sockets;
    }
}
