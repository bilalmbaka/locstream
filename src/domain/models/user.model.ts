import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import { UserRole } from 'src/core/constants/enums';
import { Asset } from './assets_model';

export class User {
    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    userName?: string;

    @ApiProperty({
        default: false,
    })
    @IsBoolean()
    emailVerified: boolean = false;

    @ApiProperty({ default: false })
    @IsBoolean()
    disabled: boolean = false;

    @ApiProperty()
    @IsString()
    @IsOptional()
    disabledReason?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    accessToken?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    refreshToken?: string;

    @ApiProperty()
    @IsDate()
    createdAt: Date;

    @ApiProperty()
    @IsDate()
    @IsOptional()
    updatedAt: Date;

    @ApiProperty({
        enum: UserRole,
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({})
    @IsObject()
    @IsOptional()
    currentLocation?: {
        lat: number;
        lng: number;
    };

    @ApiProperty()
    @IsOptional()
    profilePicture?: Asset;
}

export class TokenModel {
    @ApiProperty()
    @IsString()
    accessToken: string;

    @ApiProperty()
    @IsString()
    refreshToken: string;
}
