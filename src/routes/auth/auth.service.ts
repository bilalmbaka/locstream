import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
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
import { Helpers } from 'src/core/helpers/helpers';
import { AuthTokenService } from 'src/core/services/token_service';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { UserRole } from 'src/core/constants/enums';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { AuthUser } from 'src/domain/auth_user_decorator';


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
                        email: dto.email?.trim(),
                    },
                    {
                        userName: dto.userName?.trim(),
                    },
                ],
            });

            if (!user) {
                throw new UnauthorizedException(errorText);
            }

            if ((await bcrypt.compare(dto.password, user.password)) == false || user.deletedAt) {
                throw new UnauthorizedException(errorText);
            }

            if (user.emailVerified === false && user.role === UserRole.user) {
                await this.sendOtp(user.email);
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
            let referrerUser: UserEntity | null = null;

            const user = await this.userRepository.findOne({
                where: { email: dto.email },
                withDeleted: true,
            });

            if (user && user.emailVerified && !user.deletedAt) {
                throw new ConflictException('User with email address already exists');
            }

            if (!user) {
                await this.userRepository.save({
                    email: dto.email,
                    password: await this._hashPassword(dto.password),
                    referrerId:
                        `${Strings.appName}-${Helpers.generateUserName(dto.email)}`.toLowerCase(),
                    referredBy: referrerUser ?? undefined,
                    role: dto.role ? dto.role : UserRole.user,
                });
            }

            if (dto.role == UserRole.user) {
                await this.sendOtp(dto.email);
            }

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async sendOtp(email: string): Promise<ResponseDto<string>> {
        try {
            const user = await this.userRepository.findOneBy({
                email: email,
            });

            //TODO return a generic mail sent to otp, to prevent account enumeration
            if (!user) {
                throw new BadRequestException('User not found');
            }

            const otp = this._generateOtp();

            //Update user otp data
            await this.userRepository.update(
                {
                    email,
                },
                {
                    otp: otp,
                    otpSentAt: new Date(),
                },
            );

            this.emailService.sendMail({
                to: email,
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
            const user = await this.userRepository.findOneByOrFail({
                email: dto.email,
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

            const cleanUser = await this._genAndSaveAuthToken(
                user,
                dto.deviceMake,
                dto.os,
                dto.osVersion,
            );

            await this.userRepository.update(
                {
                    email: user.email,
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
                email: dto.email,
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
                    email: user.email,
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

            console.log('token is', token);

            const newTokens = this.authTokenService.generateFreshTokens(token.user);

            await this.accessTokenRepository.update(token, {
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
            });

            return new Status<TokenModel>().success(
                Strings.successString,
                HttpStatus.OK,
                newTokens,
            );
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }

    async _hashPassword(password: string): Promise<string> {
        const hash = await bcrypt.hash(password, 10);

        return hash;
    }

    _generateOtp(): string {
        let otp = '';
        const source = '0123456789';

        while (otp.length < 4) {
            otp = `${otp}${source.charAt(Math.floor(Math.random() * source.length))}`;
        }

        return otp;
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
}
