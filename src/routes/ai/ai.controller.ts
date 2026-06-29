import { Body, Controller, Headers, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiExtraModels,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Constants, Strings } from 'src/core/constants/constants';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';
import { AIChat } from 'src/domain/models/ai_chat.model';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { Helpers } from 'src/core/helpers/helpers';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { UserEntity } from 'src/domain/entities/user_entity';
import { AIChatDTO } from 'src/domain/dtos/ai_dto';

@Controller('ai')
@ApiBearerAuth(Constants.swaggerBearerAuth)
@ApiTags('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('/chat')
    @UseGuards(AuthenticatedUserGuard)

    //documentation
    @ApiOperation({
        description: 'Chat with ai agent',
    })
    @ApiExtraModels(AIChat)
    @ApiResponse({
        schema: {
            type: 'object',
            properties: new Status().toDoc(
                Helpers.swaggerDocPath('AIChat'),
                Strings.successString,
                HttpStatus.OK,
            ),
        },
    })
    @ApiBody({
        type: AIChatDTO,
    })
    async aiChat(
        @Headers('authorization') authToken: string,
        @AuthUser() user: UserEntity,
        @Body() dto: AIChatDTO,
    ): Promise<ResponseDto<AIChat>> {
        const chat = await this.aiService.chat(authToken, dto);

        return {
            success: false,
            message: 'Chat responded successfully',
            statusCode: HttpStatus.OK,
            data: chat,
        } satisfies ResponseDto<AIChat>;
    }
}
