import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Patch,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiExtraModels,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { User } from 'src/domain/models/user.model';
import { Helpers } from 'src/core/helpers/helpers';
import { Constants, Strings } from 'src/core/constants/constants';
import { UserEntity } from 'src/domain/entities/user_entity';
import { UpdateUserProfileDTO } from 'src/domain/dtos/user/user_dto';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

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
    @UseInterceptors(
        FileInterceptor(
            'profilePic',

            {
                storage: diskStorage({
                    destination: './uploads/',
                    filename: (req, file, cb) => {
                        // keep original name
                        cb(null, file.originalname);
                    },
                }),
                limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // applies per file
                dest: './uploads/',
                fileFilter: (req, file, cb) => {
                    if (file.mimetype.startsWith('image/')) {
                        cb(null, true);
                    } else {
                        cb(
                            new BadRequestException(
                                `Only valid ${file.fieldname} files are allowed`,
                            ),
                            false,
                        );
                    }
                },
            },
        ),
    )

    //documentation
    @ApiConsumes('multipart/form-data')
    @ApiOperation({})
    @ApiBody({
        type: UpdateUserProfileDTO,
    })
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
        @UploadedFile() profilePic?: Express.Multer.File,
    ): Promise<ResponseDto<User | string>> {
        return this.usersService.updateUserProfile(user, dto, profilePic);
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

    //Change user email
    @Patch('/change-email')

    //documentation
    @ApiOperation({})
    @ApiExtraModels(User)
    @ApiBody({
        schema: {
            type: 'String',
            example: {
                name: 'email',
            },
        },
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(Helpers.swaggerDocPath('User')),
        },
    })
    changeEmail(@AuthUser() user: UserEntity, @Body() email: string): Promise<ResponseDto<User>> {
        if (!email) throw new BadRequestException();

        return this.usersService.changeEmail(user, email);
    }

    //check if username is taken route
    @Get('/username-free')

    //documentation
    @ApiOperation({
        description: 'Check if username is available',
    })
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(undefined, 'Username is available', undefined),
        },
    })
    isUserNameAvailable(@Query('userName') userName: string): Promise<ResponseDto<boolean>> {
        if (!userName) throw new BadRequestException();

        return this.usersService.checkUserNameAvailability(userName);
    }

    //find users route
    @Get('/find')

    //documentation
    @ApiOperation({
        description: '',
    })
    @ApiQuery({ name: 'userName', type: String, example: 'jhondoe', required: true })
    @ApiQuery({ name: 'startAt', type: String, example: '0', required: false })
    @ApiQuery({ name: 'endAt', type: String, example: '20', required: false })
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
    findUser(
        @Query('userName') userName: string,
        @Query('startAt') startAt?: string,
        @Query('endAt') endAt?: string,
    ): Promise<ResponseDto<User[]>> {
        console.log('query is', userName);

        if (!userName) throw new BadRequestException();

        return this.usersService.findUsers(userName, startAt ?? '0', endAt ?? '20');
    }
}
