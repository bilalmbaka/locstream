import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CleanData } from 'src/core/helpers/clean_data';
import {
    ChangePasswordDTO,
    LoginDTO,
    ResetPasswordDTO,
    SignupDTO,
    VerifyAccountDTO,
} from 'src/domain/dtos/auth/auth.dto';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { UserEntity } from 'src/domain/entities/user_entity';
import { TokenModel, User } from 'src/domain/models/user.model';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/core/services/mail_service';
import { Strings } from 'src/core/constants/constants';
import { AuthTokenService } from 'src/core/services/token_service';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { UserRole } from 'src/core/constants/enums';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { Helpers } from 'src/core/helpers/helpers';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(AccessTokenEntity)
        private accessTokenRepository: Repository<AccessTokenEntity>,
        private emailService: EmailService,
        private authTokenService: AuthTokenService,
    ) {}

    async login(dto: LoginDTO): Promise<ResponseDto<User>> {
        try {
            const errorText = `Incorrect ${dto.userName ? 'username' : 'email'} or password`;

            const user = await this.userRepository.findOne({
                where: [
                    {
                        email: dto.email?.trim().toLowerCase(),
                    },
                    {
                        userName: dto.userName?.trim().toLowerCase(),
                    },
                ],
                relations: {
                    profilePicture: true,
                },
            });

            console.log('user is ===> ', user);

            if (!user) {
                throw new UnauthorizedException(errorText);
            }

            if ((await bcrypt.compare(dto.password, user.password)) == false || user.deletedAt) {
                throw new UnauthorizedException(errorText);
            }

            if (user.emailVerified === false && user.role === UserRole.user) {
                await this.sendOtp({
                    existingUserEmail: user.email,
                    receiverEmail: user.email,
                    verifyEmail: true,
                });
                throw new ForbiddenException('Email not veirified');
            }

            if (user.disabled) {
                throw new ForbiddenException(
                    'Your account has been disabled' +
                        (user.disabledReason ? ` because of ${user.disabledReason}` : ''),
                );
            }

            const cleanUser = await this._genAndSaveAuthToken(
                user,
                dto.deviceMake,
                dto.os,
                dto.osVersion,
            );

            return new Status<User>().success('Login successfull', HttpStatus.OK, cleanUser);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async signUp(dto: SignupDTO): Promise<ResponseDto<string>> {
        try {
            const user = await this.userRepository.findOne({
                where: [
                    { email: dto.email.toLowerCase() },
                    { userName: dto.userName.toLocaleLowerCase() },
                ],
                withDeleted: true,
            });

            if (user) {
                if (
                    user.userName == dto.userName.toLowerCase() &&
                    user.emailVerified &&
                    !user.deletedAt
                ) {
                    throw new ConflictException('User with user name already exists');
                }
                if (
                    user.email == user.email.toLowerCase() &&
                    user.emailVerified &&
                    !user.deletedAt
                ) {
                    throw new ConflictException('User with email address already exists');
                }
            }

            await this.userRepository.save({
                email: dto.email.toLowerCase(),
                userName: dto.userName.toLowerCase(),
                password: await this._hashPassword(dto.password),
                role: dto.role ? dto.role : UserRole.user,
            } as UserEntity);

            if (dto.role == UserRole.user) {
                await this.sendOtp({
                    existingUserEmail: dto.email,
                    receiverEmail: dto.email,
                    verifyEmail: true,
                });
            }

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async sendOtp(dto: {
        receiverEmail: string;
        existingUserEmail: string;
        verifyEmail: boolean;
    }): Promise<ResponseDto<string>> {
        try {
            if (dto.verifyEmail === true) {
                const user = await this.userRepository.findOne({
                    where: {
                        email: dto.existingUserEmail.toLowerCase(),
                    },
                    withDeleted: true,
                });

                //TODO return a generic mail sent to otp, to prevent account enumeration
                if (!user) {
                    throw new BadRequestException('User not found');
                }
            }

            const otp = Helpers.generateOtp();

            //Update user otp data
            await this.userRepository.update(
                {
                    email: dto.existingUserEmail.toLowerCase(),
                },
                {
                    otp: otp,
                    otpSentAt: new Date(),
                },
            );

            this.emailService.sendMail({
                to: dto.receiverEmail.toLowerCase(),
                subject: 'Your otp',
                content: otp,
            });

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async verifyAccount(dto: VerifyAccountDTO): Promise<ResponseDto<User>> {
        try {
            const user = await this.userRepository.findOneOrFail({
                where: {
                    email: dto.email.toLowerCase(),
                },
                withDeleted: true,
            });

            if (user?.role != UserRole.user) {
                throw new UnauthorizedException('Invalid role for route');
            }

            if (user?.otpSentAt == null) {
                throw new InternalServerErrorException();
            }

            if (Date.now() - user.otpSentAt!.getTime() > 5 * 60 * 1000) {
                throw new UnauthorizedException('Otp exipred');
            }

            if (!user || dto.otp !== user.otp) {
                throw new UnauthorizedException('Incorrect  otp');
            }

            if (user.deletedAt) {
                await this.userRepository.restore({
                    email: user.email.toLowerCase(),
                });
            }

            const cleanUser = await this._genAndSaveAuthToken(
                user,
                dto.deviceMake,
                dto.os,
                dto.osVersion,
            );

            cleanUser.emailVerified = true;

            await this.userRepository.update(
                {
                    email: user.email.toLowerCase(),
                },
                {
                    emailVerified: true,
                },
            );

            return new Status<User>().success(Strings.successString, HttpStatus.OK, cleanUser);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async resetPassword(dto: ResetPasswordDTO): Promise<ResponseDto<string>> {
        try {
            const user = await this.userRepository.findOneByOrFail({
                email: dto.email.toLowerCase(),
            });

            if (user?.role != UserRole.user) {
                throw new UnauthorizedException('Invalid role for route');
            }

            if (user?.otpSentAt == null) {
                throw new InternalServerErrorException();
            }

            if (Date.now() - user.otpSentAt!.getTime() > 5 * 60 * 1000) {
                throw new UnauthorizedException('Otp exipred');
            }

            if (!user || dto.otp !== user.otp) {
                throw new UnauthorizedException('Incorrect  otp');
            }

            const hashedPassword = await this._hashPassword(dto.password);

            await this.userRepository.update(
                {
                    email: user.email.toLowerCase(),
                },
                {
                    emailVerified: true,
                    password: hashedPassword,
                },
            );

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
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

            const hashedPassword = await this._hashPassword(dto.newPassword);

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

    async refreshToken(refreshToken: string): Promise<ResponseDto<TokenModel>> {
        try {
            const token = await this.accessTokenRepository.findOneOrFail({
                where: {
                    refreshToken: refreshToken,
                },
                relations: {
                    user: true,
                },
            });

            const newTokens = this.authTokenService.generateFreshTokens(token.user);

            await this.accessTokenRepository.update(
                {
                    refreshToken: refreshToken,
                },
                {
                    accessToken: newTokens.accessToken,
                    refreshToken: newTokens.refreshToken,
                },
            );

            return new Status<TokenModel>().success(
                Strings.successString,
                HttpStatus.OK,
                newTokens,
            );
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async suggestUserNames(email: string): Promise<ResponseDto<string[]>> {
        try {
            let index: number = 0;
            const names: string[] = [];

            while (names.length < 5 && index < 10) {
                const suggestion = Helpers.generateUserName(email);

                const existingUser = await this.userRepository.findOneBy({
                    userName: suggestion,
                });

                if (!existingUser) {
                    names.push(suggestion);
                }

                index++; //incase we just couldn't generate a non existent username.
                //then prevent an infinite loop
            }

            return new Status<string[]>().success(Strings.successString, HttpStatus.OK, names);
        } catch (e) {
            throw e;
        }
    }

    async _hashPassword(password: string): Promise<string> {
        const hash = await bcrypt.hash(password, 10);

        return hash;
    }

    async _genAndSaveAuthToken(
        user: UserEntity,
        deviceMake: string,
        os: string,
        osVersion: string,
    ): Promise<User> {
        const cleanUser = CleanData.cleanUser(user);

        const authToken = this.authTokenService.generateFreshTokens(user);

        cleanUser.accessToken = authToken.accessToken;
        cleanUser.refreshToken = authToken.refreshToken;

        await this.accessTokenRepository.save({
            accessToken: authToken.accessToken,
            refreshToken: authToken.refreshToken,
            deviceMake: deviceMake,
            os: os,
            osVersion: osVersion,
            user: user,
        } as AccessTokenEntity);

        return cleanUser;
    }

    async logout(accessToken: string): Promise<ResponseDto<string>> {
        try {
            const token = accessToken.substring(7);

            await this.accessTokenRepository.delete({
                accessToken: token,
            });

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }
}
