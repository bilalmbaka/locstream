import {
    BadRequestException,
    ConflictException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Strings } from 'src/core/constants/constants';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { CleanData } from 'src/core/helpers/clean_data';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { FindUserByUserNameDTO, UpdateUserProfileDTO } from 'src/domain/dtos/user/user_dto';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { UserEntity } from 'src/domain/entities/user_entity';
import { User } from 'src/domain/models/user.model';
import { ILike, Repository } from 'typeorm';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { AssetsService } from 'src/routes/assets/assets.service';
import { AuthService } from 'src/routes/auth/auth.service';
import { AssetsEntity } from 'src/domain/entities/assets_entity';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDTO } from 'src/domain/dtos/auth/auth.dto';
import { UserRole } from 'src/core/constants/enums';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(AccessTokenEntity)
        private accessTokenRepository: Repository<AccessTokenEntity>,

        private assetService: AssetsService,
        private authService: AuthService,
    ) {}

    async fetchUserById(userId: string, withDeleted: boolean = false): Promise<ResponseDto<User>> {
        try {
            const user = await this.userRepository.findOneOrFail({
                where: { id: userId },
                withDeleted: withDeleted,
                relations: ['profilePicture'],
            });

            return new Status<User>().success(
                Strings.successString,
                HttpStatus.OK,
                CleanData.cleanUser(user),
            );
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async deleteUserAccount(userId: string, remove: boolean): Promise<ResponseDto<string>> {
        try {
            if (remove) {
                await this.userRepository.softDelete({
                    id: userId,
                });
            } else {
                await this.userRepository.restore({
                    id: userId,
                });
            }

            // delete all tokens for that user
            await this.accessTokenRepository.delete({
                user: { id: userId },
            });

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async updateUserProfile(
        @AuthUser() user: UserEntity,
        dto: UpdateUserProfileDTO,
        profilePic?: Express.Multer.File,
    ): Promise<ResponseDto<User | string>> {
        try {
            var picture: AssetsEntity | undefined;

            if (dto.email) {
                const existingUser = await this.userRepository.findOneBy([
                    {
                        email: dto.email,
                        emailVerified: true,
                    },
                ]);

                if (existingUser) {
                    throw new ConflictException(`Email taken`);
                }

                return await this.authService.sendOtp({
                    existingUserEmail: user.email,
                    receiverEmail: dto.email,
                    verifyEmail: true,
                });
            }

            if (dto.userName) {
                const existingUser = await this.userRepository.findOneBy([
                    {
                        userName: dto.userName,
                    },
                ]);

                if (existingUser) {
                    throw new ConflictException(`Username taken`);
                }
            }

            if (profilePic) {
                picture = await this.assetService.uploadFile(profilePic!);
            }

            var currentLocation:
                | undefined
                | {
                      lat: number;
                      lng: number;
                  };

            if (dto.currentLocation) {
                currentLocation = JSON.parse(dto.currentLocation);
            }

            await this.userRepository.save(
                {
                    id: user.id,
                    userName: dto.userName,
                    profilePicture: picture,
                    currentLocation: {
                        type: 'Point',
                        coordinates: [currentLocation?.lng, currentLocation?.lat],
                    },
                } as UserEntity,
                {
                    listeners: dto.currentLocation ? true : false,
                },
            );

            const updatedProfile = await this.fetchUserById(user.id);

            return updatedProfile;
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async changeEmail(@AuthUser() user: UserEntity, email: string): Promise<ResponseDto<User>> {
        try {
            const userData = await this.userRepository.findOneByOrFail({
                id: user.id,
            });

            if (userData?.otpSentAt == null) {
                throw new InternalServerErrorException();
            }

            if (Date.now() - userData.otpSentAt!.getTime() > 5 * 60 * 1000) {
                throw new UnauthorizedException('Otp exipred');
            }

            if (!user || userData.otp !== user.otp) {
                throw new UnauthorizedException('Incorrect  otp');
            }

            await this.userRepository.save(
                {
                    id: user.id,
                    email: email,
                },
                {
                    listeners: false,
                },
            );

            return this.fetchUserById(user.id);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async checkUserNameAvailability(username: string): Promise<ResponseDto<boolean>> {
        try {
            if (username.length < 5) {
                throw new BadRequestException('Username too short');
            }

            const regex = /^[a-zA-Z0-9]+$/; // only letters and numbers

            if (!regex.test(username)) {
                throw new BadRequestException('Username must contain only letters and numbers');
            }

            const userData = await this.userRepository.findOneBy({
                userName: username.trim().toLowerCase(),
            });

            console.log('userdata', userData);

            if (userData) throw new ConflictException();

            return new Status<boolean>().success('Username available', HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async changePassword(
        dto: ChangePasswordDTO,
        @AuthUser() user: UserEntity,
    ): Promise<ResponseDto<string>> {
        try {
            console.log('user is ', user);
            console.log('user is ', dto.oldPassword);
            console.log('new user pass', user.password);

            if ((await bcrypt.compare(dto.oldPassword, user.password)) == false) {
                throw new UnauthorizedException('current password does not match');
            }

            const hashedPassword = await await bcrypt.hash(dto.newPassword, 10);

            await this.userRepository.update(
                {
                    id: user.id,
                },
                {
                    password: hashedPassword,
                },
            );

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async findUsers(dto: FindUserByUserNameDTO): Promise<ResponseDto<User[]>> {
        try {
            var whereObject = {};
            const where: any[] = [];

            if (dto.userName) {
                where.push({ userName: ILike(`%${dto.userName}%`) });
            }

            if (where.length > 0) {
                whereObject = { ...where };
            }

            console.log('where objects', where);

            const users = await this.userRepository.find({
                where: { userName: ILike(`%${dto.userName}%`) },
                skip: Number(dto.startAt ?? '0'),
                take: Number(dto.endAt ?? '20'),
                order: {
                    userName: 'ASC',
                },
            });

            console.log('user is ', users);

            const cleanUsers = users.map((user) => {
                user.role = UserRole.user;
                user.currentLocation = {
                    type: 'Point',
                    coordinates: [0, 0],
                };

                return CleanData.cleanUser(user);
            });

            return new Status<User[]>().success(Strings.successString, HttpStatus.OK, cleanUsers);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }
}
