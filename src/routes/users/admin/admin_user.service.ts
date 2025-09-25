import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { ILike, Repository } from 'typeorm';
import { UserEntity } from 'src/domain/entities/user_entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Strings } from 'src/core/constants/constants';
import { UserRole } from 'src/core/constants/enums';
import {
    AdminDeleteUserProfileDTO,
    AdminDisableUserProfileDTO,
    AdminUpdateUserProfileDTO,
    FindUserDTO,
} from 'src/domain/dtos/user/user_dto';
import { UsersService } from '../user/users.service';
import { User } from 'src/domain/models/user.model';
import { CleanData } from 'src/core/helpers/clean_data';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { AuthUser } from 'src/domain/auth_user_decorator';

@Injectable()
export class AdminUserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private userService: UsersService,
    ) {}

    async markAccountAsVerified(userId: string): Promise<ResponseDto<string>> {
        try {
            await this.userRepository.update(
                {
                    id: userId,
                },
                {
                    emailVerified: true,
                },
            );

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async changeUserRole(userId: string, role: UserRole): Promise<ResponseDto<string>> {
        try {
            await this.userRepository.update(
                {
                    id: userId,
                },
                {
                    role: role,
                },
            );

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async updateUserProfile(
        @AuthUser() user: UserEntity,
        dto: AdminUpdateUserProfileDTO,
    ): Promise<ResponseDto<User>> {
        try {
            const targetUser = await this.userService.fetchUserById(dto.userId);

            if (user.role == UserRole.moderator && targetUser.data!.role != UserRole.user) {
                throw new UnauthorizedException('You can only modify normal user accounts');
            }

            const existingUser = await this.userRepository.findOneBy([
                {
                    userName: dto.userName,
                },
                {
                    email: dto.email,
                },
            ]);

            if (existingUser) {
                throw new ConflictException(
                    `${dto.email == existingUser.email ? 'Email' : 'Username'} taken`,
                );
            }

            await this.userRepository.update(
                {
                    id: dto.userId,
                },
                {
                    email: dto.email,
                    userName: dto.userName,
                },
            );

            const updatedProfile = await this.userService.fetchUserById(dto.userId);

            return updatedProfile;
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async disableProfile(
        @AuthUser() user: UserEntity,
        dto: AdminDisableUserProfileDTO,
    ): Promise<ResponseDto<User>> {
        try {
            const targetUser = await this.userService.fetchUserById(dto.userId);

            if (user.role == UserRole.moderator && targetUser.data!.role != UserRole.user) {
                throw new UnauthorizedException(
                    `You can only ${dto.disable ? 'disable' : 'enable'} normal user accounts`,
                );
            }

            await this.userRepository.update(
                {
                    id: dto.userId,
                },
                {
                    disabled: dto.disable,
                    disabledReason: dto.disable ? dto.disabledReason : '',
                },
            );

            const updatedProfile = await this.userService.fetchUserById(dto.userId);

            return updatedProfile;
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async deleteUserAccount(
        @AuthUser() user: UserEntity,
        dto: AdminDeleteUserProfileDTO,
    ): Promise<ResponseDto<string>> {
        try {
            const targetUser = await this.userService.fetchUserById(dto.userId, true);

            if (user.role == UserRole.moderator && targetUser.data!.role != UserRole.user) {
                throw new UnauthorizedException(`You can only delete normal user account`);
            }

            await this.userService.deleteUserAccount(dto.userId, dto.delete);

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async findUsers(user: UserEntity, dto: FindUserDTO): Promise<ResponseDto<User[]>> {
        try {
            var whereObject = {};
            const where: any[] = [];

            if (dto.id) {
                where.push({ id: ILike(`%${dto.id}%`) });
            }

            if (dto.userName) {
                where.push({ userName: ILike(`%${dto.userName}%`) });
            }

            if (dto.email) {
                where.push({ email: ILike(`%${dto.email}%`) });
            }

            if (where.length > 0) {
                whereObject = { ...where };
            }

            if (user.role == UserRole.moderator) {
                whereObject['role'] = UserRole.user;
            }

            const users = await this.userRepository.find({
                where: whereObject,
                skip: Number(dto.startAt ?? '0'),
                take: Number(dto.endAt ?? '20'),
                order: {
                    email: 'ASC',
                    userName: 'ASC',
                },
            });

            const cleanUsers = users.map((user) => {
                return CleanData.cleanUser(user);
            });

            return new Status<User[]>().success(Strings.successString, HttpStatus.OK, cleanUsers);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }
}
