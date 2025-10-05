import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Strings } from 'src/core/constants/constants';
import { UserRole } from 'src/core/constants/enums';

export class LoginDTO {
    @ApiProperty({
        example: Strings.exampleEmail,
        required: false,
    })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: Strings.exampleUserName,
    })
    @IsString()
    @IsOptional()
    userName?: string;

    @ApiProperty({
        example: Strings.examplePassword,
    })
    @IsString()
    password: string;

    @ApiProperty({
        example: 'Samsung galaxy s5',
    })
    @IsString()
    deviceMake: string;

    @ApiProperty({
        example: 'Android',
    })
    @IsString()
    os: string;

    @ApiProperty({
        example: 'Android 10',
    })
    @IsString()
    osVersion: string;
}

export class OauthLoginDTO {
    @ApiProperty()
    @IsString()
    @IsOptional()
    googleToken?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    facebookToken?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    twitterToken?: string;
}

export class SignupDTO {
    @ApiProperty({
        example: Strings.exampleEmail,
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: Strings.examplePassword,
    })
    @IsString()
    password: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class VerifyAccountDTO {
    @ApiProperty({
        example: Strings.exampleOtp,
    })
    @IsString()
    otp: string;

    @ApiProperty({
        example: Strings.exampleEmail,
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'Samsung galaxy s5',
    })
    @IsString()
    deviceMake: string;

    @ApiProperty({
        example: 'Android',
    })
    @IsString()
    os: string;

    @ApiProperty({
        example: 'Android 10',
    })
    @IsString()
    osVersion: string;
}

export class ResetPasswordDTO {
    @ApiProperty({
        example: Strings.exampleOtp,
    })
    @IsString()
    otp: string;

    @ApiProperty({
        example: Strings.exampleEmail,
    })
    @IsString()
    email: string;

    @ApiProperty({
        example: Strings.examplePassword,
    })
    @IsString()
    password: string;
}

export class ChangePasswordDTO {
    @ApiProperty({
        example: Strings.examplePassword,
    })
    @IsString()
    oldPassword: string;

    @ApiProperty({
        example: Strings.examplePassword,
    })
    @IsString()
    newPassword: string;
}
