import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { User } from 'src/domain/models/user.model';
import { Helpers } from 'src/core/helpers/helpers';
import { Constants, Strings } from 'src/core/constants/constants';
import { UserEntity } from 'src/domain/entities/user_entity';
import { UpdateUserProfileDTO } from 'src/domain/dtos/user/user_dto';
import { AuthUser } from 'src/domain/auth_user_decorator';

@Controller('user')
@UseGuards(AuthenticatedUserGuard)
@ApiBearerAuth(Constants.swaggerBearerAuth)
@ApiTags('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/profile')

    //documentation
    @ApiOperation({
        description: 'Get logged in user profile',
    })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(
                Helpers.swaggerDocPath('User'),
                Strings.successString,
                HttpStatus.OK,
            ),
        },
    })
    fetchProfile(@AuthUser() user: UserEntity): Promise<ResponseDto<User>> {
        return this.usersService.fetchUserById(user.id);
    }

    //update user profile route
    @Patch('/update-profile')

    //documentation
    @ApiOperation({})
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(Helpers.swaggerDocPath('User')),
        },
    })
    updateProfile(
        @AuthUser() user: UserEntity,
        @Body() dto: UpdateUserProfileDTO,
    ): Promise<ResponseDto<User>> {
        return this.usersService.updateUserProfile(user, dto);
    }

    //update user profile route
    @Delete('/delete-profile')

    //documentation
    @ApiOperation({})
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(),
        },
    })
    deleteProfile(@AuthUser() user: UserEntity): Promise<ResponseDto<string>> {
        return this.usersService.deleteUserAccount(user.id, true);
    }
}
