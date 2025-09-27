import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/domain/entities/user_entity';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { Repository } from 'typeorm';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ShareLocationWebsocketGatewayService {
    constructor(
        @InjectRepository(AccessTokenEntity)
        private accessTokenRepository: Repository<AccessTokenEntity>,
    ) {}

    async fetchUserProfile(accessToken: string): Promise<UserEntity> {
        try {
            const user = await this.accessTokenRepository
                .createQueryBuilder('access_tokens')
                .leftJoinAndSelect('access_tokens.user', 'user')
                .leftJoinAndSelect('user.sharedLocations', 'sharedLocations') //Every one who allows you to see their location
                .leftJoinAndSelect('sharedLocations.profilePicture', 'sharerProfilePicture')
                .leftJoinAndSelect('user.locationReceivers', 'locationReceiver') //Every one who can see the user's location
                .leftJoinAndSelect('locationReceiver.profilePicture', 'receiverProfilePicture')
                .where('access_tokens.access_token = :access_token', {
                    access_token: accessToken,
                })
                .getOneOrFail();

            return user.user;
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }
}
