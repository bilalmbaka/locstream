import { HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Strings } from 'src/core/constants/constants';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { CleanData } from 'src/core/helpers/clean_data';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { UserEntity } from 'src/domain/entities/user_entity';
import { User } from 'src/domain/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class ShareLocationService {
    constructor(
        @InjectRepository(UserEntity)
        private userController: Repository<UserEntity>,
    ) {}

    async shareLocationWithUser(
        @AuthUser() user: UserEntity,
        otherPartyId: string,
    ): Promise<ResponseDto<string>> {
        try {
            if (user.id === otherPartyId) {
                throw new InternalServerErrorException('Cannot listen to youself');
            }

            await this.userController
                .createQueryBuilder()
                .relation(UserEntity, 'locationReceivers')
                .of(user.id) // the "owner" side
                .add(otherPartyId); // the user to link

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async stopSharingLocationWithUser(
        @AuthUser() user: UserEntity,
        otherPartyId: string,
    ): Promise<ResponseDto<string>> {
        try {
            if (user.id === otherPartyId) {
                throw new InternalServerErrorException('Cannot listen to youself');
            }

            console.log('other receier id', otherPartyId);

            await this.userController
                .createQueryBuilder()
                .relation(UserEntity, 'locationReceivers')
                .of(user.id)
                .remove(otherPartyId);

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    //Everybody that is receiving a user location
    async allLocationReceivers(@AuthUser() user: UserEntity): Promise<ResponseDto<User[]>> {
        try {
            const userWithReceivers = await this.userController
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.locationReceivers', 'receiver')
                .leftJoinAndSelect('receiver.profilePicture', 'receiverProfilePicture') // 👈 join each receiver's profile picture
                .where('user.id = :id', { id: user.id })
                .select([
                    'user.id',
                    'receiver.id',
                    'receiver.email',
                    'receiver.userName',
                    'receiverProfilePicture',
                    'receiver.currentLocation',
                    'receiver.createdAt',
                    'receiver.updatedAt',
                ])
                .getOne();

            return new Status<User[]>().success(
                Strings.successString,
                HttpStatus.OK,
                userWithReceivers?.locationReceivers.map((e) => CleanData.cleanUser(e)),
            );
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    //Everybody that is sharing their location with a user
    async allLocationShares(@AuthUser() user: UserEntity): Promise<ResponseDto<User[]>> {
        try {
            const userWithReceivers = await this.userController
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.sharedLocations', 'sharer')
                .leftJoinAndSelect('sharer.profilePicture', 'sharerProfilePicture') // 👈 join each receiver's profile picture
                .where('user.id = :id', { id: user.id })
                .select([
                    'user.id',
                    'sharer.id',
                    'sharer.email',
                    'sharer.userName',
                    'sharerProfilePicture',
                    'sharer.currentLocation',
                    'sharer.createdAt',
                    'sharer.updatedAt',
                    'sharer.lastSeen',
                    'sharer.currentAddress',
                ])
                .getOne();

            console.log('user profile all locations ', userWithReceivers);

            return new Status<User[]>().success(
                Strings.successString,
                HttpStatus.OK,
                userWithReceivers?.sharedLocations.map((e) => CleanData.cleanUser(e)),
            );
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }
}
