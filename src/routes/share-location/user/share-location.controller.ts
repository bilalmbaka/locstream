import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ShareLocationService } from './share-location.service';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiExtraModels,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { UserEntity } from 'src/domain/entities/user_entity';
import { Constants, Strings } from 'src/core/constants/constants';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';
import { Helpers } from 'src/core/helpers/helpers';
import { User } from 'src/domain/models/user.model';

@Controller('share-location')
@UseGuards(AuthenticatedUserGuard)
@ApiTags('share-location')
@ApiBearerAuth(Constants.swaggerBearerAuth)
export class ShareLocationController {
    constructor(private readonly shareLocationService: ShareLocationService) {}

    @Get('location-receivers')

    //generate documentation
    @ApiOperation({
        description: 'List of all the people you are sharing your location with',
    })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'String',
            properties: new Status<User[]>().toDoc(
                Helpers.swaggerDocPath('User'),
                undefined,
                undefined,
                'Array',
            ),
        },
    })
    locationReceivers(@AuthUser() user: UserEntity): Promise<ResponseDto<User[]>> {
        return this.shareLocationService.allLocationReceivers(user);
    }

    @Get('location-shares')

    //generate documentation
    @ApiOperation({
        description: 'List of all the people you are sharing their location with you',
    })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'String',
            properties: new Status<User[]>().toDoc(
                Helpers.swaggerDocPath('User'),
                undefined,
                undefined,
                'Array',
            ),
        },
    })
    locationSharers(@AuthUser() user: UserEntity): Promise<ResponseDto<User[]>> {
        return this.shareLocationService.allLocationShares(user);
    }

    @Patch('share-location')

    //generate documentation
    @ApiOperation({
        description: 'Share location with a user',
    })
    @ApiBody({
        schema: {
            type: 'String',
            properties: {
                userId: {
                    type: 'string',
                },
            },
            example: {
                name: Strings.exampleUUID,
            },
        },
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(
                undefined,
                Strings.successString,
                HttpStatus.OK,
                undefined,
                true,
            ),
        },
    })
    shareLocation(
        @AuthUser() user: UserEntity,
        @Body('userId') userId: string,
    ): Promise<ResponseDto<string>> {
        if (!userId) {
            throw new BadRequestException();
        }

        return this.shareLocationService.shareLocationWithUser(user, userId);
    }

    @Patch('stop-sharing-location')

    //generate documentation
    @ApiOperation({
        description: 'Stop sharing location with a user',
    })
    @ApiBody({
        schema: {
            type: 'String',
            properties: {
                userId: {
                    type: 'string',
                },
            },
            example: {
                name: Strings.exampleUUID,
            },
        },
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(
                undefined,
                Strings.successString,
                HttpStatus.OK,
                undefined,
                true,
            ),
        },
    })
    stopLocationShare(
        @AuthUser() user: UserEntity,
        @Body() userId: string,
    ): Promise<ResponseDto<string>> {
        if (!userId) {
            throw new BadRequestException();
        }

        return this.shareLocationService.stopSharingLocationWithUser(user, userId);
    }
}
