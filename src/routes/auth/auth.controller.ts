import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    BadRequestException,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ChangePasswordDTO,
    LoginDTO,
    ResetPasswordDTO,
    SignupDTO,
    VerifyAccountDTO,
} from 'src/domain/dtos/auth/auth.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiExtraModels,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { TokenModel, User } from 'src/domain/models/user.model';
import { Helpers } from 'src/core/helpers/helpers';
import { Constants, Strings } from 'src/core/constants/constants';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';
import { UserEntity } from 'src/domain/entities/user_entity';
import { UserRole } from 'src/core/constants/enums';
import { AuthUser } from 'src/domain/auth_user_decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //Login route
    @Post('/login')

    //Login documentation
    @ApiOperation({
        summary: 'Login',
        description: 'Either email / username must be given',
    })
    @ApiBody({ type: LoginDTO })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<User>().toDoc(
                Helpers.swaggerDocPath('User'),
                'Login successfull',
                HttpStatus.CREATED,
            ),
        },
    })
    login(@Body() dto: LoginDTO): Promise<ResponseDto<User>> {
        if (!dto.email && !dto.userName) throw new BadRequestException();

        return this.authService.login(dto);
    }

    //Signup route
    @Post('signup')

    //Signup documentation
    @ApiOperation({
        summary: 'Signup',
    })
    @ApiBody({ type: SignupDTO })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<User>().toDoc(
                Helpers.swaggerDocPath('User'),
                'Signup successfull',
                HttpStatus.OK,
            ),
        },
    })
    signup(@Body() dto: SignupDTO): Promise<ResponseDto<string>> {
        if (!dto.role) {
            dto.role = UserRole.user;
        }

        return this.authService.signUp(dto);
    }

    //Request otp route
    @Post('request-otp')
    @HttpCode(HttpStatus.OK)

    //documentation
    @ApiOperation({
        summary: 'Request otp',
    })
    @ApiBody({
        examples: {},
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'user@gmail.com',
                },
            },
        },
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<User>().toDoc(
                undefined,
                'otp sent to email',
                HttpStatus.OK,
                undefined,
                true,
            ),
        },
    })
    sendOtp(@Body() body: { email: string }): Promise<ResponseDto<string>> {
        return this.authService.sendOtp(body.email);
    }

    //Verify account route
    @Post('verify-account')
    @HttpCode(HttpStatus.OK)

    //Documentation
    @ApiOperation({
        description: 'Complete signup',
    })
    @ApiExtraModels(VerifyAccountDTO)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<User>().toDoc(Helpers.swaggerDocPath('User')),
        },
    })
    verifyAccount(@Body() dto: VerifyAccountDTO): Promise<ResponseDto<User>> {
        return this.authService.verifyAccount(dto);
    }

    //Reset password route
    @Patch('reset-password')
    @HttpCode(HttpStatus.OK)

    //Documentation
    @ApiOperation({
        description: 'Reset password',
    })
    @ApiExtraModels(ResetPasswordDTO)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<string>().toDoc(
                undefined,
                Strings.successString,
                HttpStatus.OK,
                undefined,
                true,
            ),
        },
    })
    resetPassword(@Body() dto: ResetPasswordDTO): Promise<ResponseDto<string>> {
        return this.authService.resetPassword(dto);
    }

    //Change password route
    @Patch('change-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthenticatedUserGuard)

    //Documentation
    @ApiBearerAuth(Constants.swaggerBearerAuth)
    @ApiOperation({
        description: 'Change password',
    })
    @ApiExtraModels(ChangePasswordDTO)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<string>().toDoc(
                undefined,
                Strings.successString,
                HttpStatus.OK,
                undefined,
                true,
            ),
        },
    })
    changePassword(
        @Body() dto: ChangePasswordDTO,
        @AuthUser() user: UserEntity,
    ): Promise<ResponseDto<string>> {
        return this.authService.changePassword(dto, user);
    }

    //Refresh token route
    @Patch('refresh-token')
    @HttpCode(HttpStatus.OK)

    //Documentation
    @ApiExtraModels(TokenModel)
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
        },
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status<string>().toDoc(Helpers.swaggerDocPath('TokenModel')),
        },
    })
    refreshToken(@Body() dto: { refreshToken: string }): Promise<ResponseDto<TokenModel>> {
        if (!dto.refreshToken) {
            throw new BadRequestException();
        }

        return this.authService.refreshToken(dto.refreshToken);
    }
}
