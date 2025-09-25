import {
    Controller,
    Patch,
    UseGuards,
    Query,
    HttpStatus,
    Body,
    BadRequestException,
    Get,
    Param,
    Delete,
} from '@nestjs/common';
import { AdminUserService } from './admin_user.service';
import { AdminOnlyGuard } from 'src/guards/admin_only_guard';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Constants, Strings } from 'src/core/constants/constants';
import { UserRole } from 'src/core/constants/enums';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';
import {
    AdminDeleteUserProfileDTO,
    AdminDisableUserProfileDTO,
    AdminUpdateUserProfileDTO,
    FindUserDTO,
} from 'src/domain/dtos/user/user_dto';
import { User } from 'src/domain/models/user.model';
import { Helpers } from 'src/core/helpers/helpers';
import { UserEntity } from 'src/domain/entities/user_entity';
import { AuthUser } from 'src/domain/auth_user_decorator';


@Controller('admin/users')
@ApiBearerAuth(Constants.swaggerBearerAuth)
@UseGuards(AuthenticatedUserGuard, PriviledgeUserController)
@ApiTags('admin/users')
export class PriviledgeUserController {
    constructor(private readonly priviledgeUserService: AdminUserService) {}

    //verify account route
    @Patch('/mark-account-as-verified')
    @UseGuards(AdminOnlyGuard)

    //Documentation
    @ApiOperation({
        summary: 'mark an account as verified (Admin only)',
    })
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
    verifyAccount(@Query('userId') userId: string): Promise<ResponseDto<string>> {
        return this.priviledgeUserService.markAccountAsVerified(userId);
    }

    //Change user role route
    @Patch('/change-user-role')
    @UseGuards(AdminOnlyGuard)

    //Documentation
    @ApiOperation({
        summary: "Changes a user's role  (Admin only)",
    })
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
    changeRole(
        @Query('userId') userId: string,
        @Query('role') role: UserRole,
    ): Promise<ResponseDto<string>> {
        return this.priviledgeUserService.changeUserRole(userId, role);
    }

    //update user profile route
    @Patch('/update-user-profile')

    //documentation
    @ApiOperation({
        description:
            'Update a user profile, user the normal update profile route to update your own profile, moderators can only update normal users account and admins can update any body account',
    })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(Helpers.swaggerDocPath('User')),
        },
    })
    updateUserProfile(
        @AuthUser() user: UserEntity,
        @Body() dto: AdminUpdateUserProfileDTO,
    ): Promise<ResponseDto<User>> {
        if (!dto.email && !dto.userName) throw new BadRequestException();

        if (user.id == dto.userId) {
            throw new BadRequestException('Use normal route to edit your own profile');
        }

        return this.priviledgeUserService.updateUserProfile(user, dto);
    }

    //ban/unban user profile route
    @Patch('/toggle-disable')

    //documentation
    @ApiOperation({
        description:
            'Diable/enable user, you cannot disable own profile, moderators can only disable users account and admin can disable all account types',
    })
    @ApiExtraModels(User)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(Helpers.swaggerDocPath('User')),
        },
    })
    toggleDisable(
        @AuthUser() user: UserEntity,
        @Body() dto: AdminDisableUserProfileDTO,
    ): Promise<ResponseDto<User>> {
        if (user.id == dto.userId) {
            throw new BadRequestException(
                `You cannot ${dto.disable ? 'disable' : 'enable'} your own profile`,
            );
        }

        return this.priviledgeUserService.disableProfile(user, dto);
    }

    //delete/un-delete user profile route
    @Delete('/delete')

    //documentation
    @ApiOperation({
        description:
            'Delete user, you cannot delete own profile using this route, moderators can only delete users account and admin can delete all account types',
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(),
        },
    })
    deleteUserAccount(
        @AuthUser() user: UserEntity,
        @Body() dto: AdminDeleteUserProfileDTO,
    ): Promise<ResponseDto<string>> {
        if (user.id == dto.userId) {
            throw new BadRequestException(`You cannot delete your own profile using this route`);
        }

        return this.priviledgeUserService.deleteUserAccount(user, dto);
    }

    //find users route
    @Get('/find')

    //documentation
    @ApiOperation({
        description: '',
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(
                Helpers.swaggerDocPath('User'),
                undefined,
                undefined,
                'arrray',
            ),
        },
    })
    find(@AuthUser() user: UserEntity, @Param() dto: FindUserDTO): Promise<ResponseDto<User[]>> {
        Helpers.validatePagination(dto.startAt, dto.endAt);

        return this.priviledgeUserService.findUsers(user,dto);
    }
}
