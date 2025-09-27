import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { Strings } from 'src/core/constants/constants';

export class AdminUpdateUserProfileDTO {
    @ApiProperty({
        example: Strings.exampleUUID,
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        example: Strings.exampleEmail,
    })
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({
        example: Strings.exampleUserName,
    })
    @IsString()
    @IsOptional()
    userName: string;
}

export class AdminDisableUserProfileDTO {
    @ApiProperty({
        example: Strings.exampleUUID,
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        type: 'boolean',
        example: true,
    })
    @IsBoolean()
    disable: boolean;

    @ApiProperty({
        example: 'Suspicious activity',
    })
    @IsString()
    @IsOptional()
    disabledReason: string;
}

export class AdminDeleteUserProfileDTO {
    @ApiProperty({
        example: Strings.exampleUUID,
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        example: true,
    })
    @IsBoolean()
    delete: boolean;
}

export class UpdateUserProfileDTO {
    @ApiProperty({
        type: String,
        format: 'binary',
        required: false,
    })
    @IsString()
    @IsOptional()
    profilePic: string[];

    @ApiProperty({
        example: Strings.exampleEmail,
    })
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({
        example: Strings.exampleUserName,
    })
    @IsString()
    @IsOptional()
    userName: string;

    @ApiProperty({
        type: Object,
        description: 'Coordinates of the location',
        example: {
            lat: 1.2345,
            lng: 0.14455,
        },
        required: false,
    })
    @IsOptional()
    currentLocation: string;
}

export class FindUserDTO {
    @ApiProperty({
        example: 1,
        required: false,
    })
    @IsString()
    @IsOptional()
    startAt: string;

    @ApiProperty({
        example: 20,
        required: false,
    })
    @IsString()
    @IsOptional()
    endAt: string;

    @ApiProperty({
        example: Strings.exampleUserName,
        required: false,
    })
    @IsString()
    @IsOptional()
    userName: string;

    @ApiProperty({
        example: Strings.exampleEmail,
        required: false,
    })
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty({
        example: Strings.exampleUUID,
        required: false,
    })
    @IsString()
    @IsOptional()
    id: string;
}
