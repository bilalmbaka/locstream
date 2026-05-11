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
import { UpdateUserProfileDTO } from 'src/domain/dtos/user/user_dto';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { UserEntity } from 'src/domain/entities/user_entity';
import { User } from 'src/domain/models/user.model';
import { ILike, Repository } from 'typeorm';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { AssetsService } from 'src/routes/assets/assets.service';
import { AuthService } from 'src/routes/auth/auth.service';
import { AssetsEntity } from 'src/domain/entities/assets_entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(AccessTokenEntity)
        private accessTokenRepository: Repository<AccessTokenEntity>,

        private assetService: AssetsService,
        private authService: AuthService,
        private httpService: HttpService,
        private configService: ConfigService,
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

            // if (dto.email) {
            //     const existingUser = await this.userRepository.findOneBy([
            //         {
            //             email: dto.email,
            //         },
            //     ]);

            //     if (existingUser) {
            //         throw new ConflictException(`Email taken`);
            //     }

            //     return await this.authService.sendOtp({
            //         existingUserEmail: user.email,
            //         receiverEmail: dto.email,
            //         verifyEmail: true,
            //     });
            // }

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
            var address: string | undefined;

            if (dto.currentLocation) {
                console.log(user.userName, 'updated their location', dto.currentLocation);

                currentLocation =
                    typeof dto.currentLocation === 'object'
                        ? dto.currentLocation
                        : JSON.parse(dto.currentLocation as string);
                address = await this._reverseGeoCode(currentLocation!.lat, currentLocation!.lng);
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
                    currentAddress: address,
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

    private async _reverseGeoCode(lat: number, lng: number): Promise<string> {
        try {
            const api = await this.httpService.axiosRef.post(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&location_type=ROOFTOP&key=${this.configService.get<string>('GOOGLE_MAPS_KEY')}`,
                //  {
                //      headers: {
                //          'X-Goog-Api-Key': this.configService.get<string>('GOOGLE_MAPS_KEY'),
                //          'X-Goog-FieldMask': this._defaultFieldMask,
                //      },
                //  },
            );

            const response = api.data;

            if (response.status !== 'OK') {
                throw response;
            }

            const results = response.results as { [key: string]: any }[];

            if (results.length == 0) return '';

            return results[0]['formatted_address'];
        } catch (e) {
            console.log('Error reverse geocoding position', e);

            return '';
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
            if (!regex.test(username)) {
                throw new BadRequestException('Username must contain only letters and numbers');
            }

            const userData = await this.userRepository.findOneBy({
                userName: username.trim().toLowerCase(),
            });

            console.log('userdata', userData);
            console.log('userdata', userData);

            if (userData) throw new ConflictException();

            return new Status<boolean>().success('Username available', HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async findUsers(
        userName: string,
        startAt: string,
        endAt: string,
    ): Promise<ResponseDto<User[]>> {
        try {
            const users = await this.userRepository.find({
                where: { userName: ILike(`%${userName}%`) },
                skip: Number(startAt ?? '0'),
                take: Number(endAt ?? '20'),
                order: {
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
