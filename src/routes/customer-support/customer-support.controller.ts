import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CustomerSupportService } from './customer-support.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { Constants, Strings } from 'src/core/constants/constants';
import { CustomerSupportDTO } from 'src/domain/dtos/customer_support_dto';
import { UserEntity } from 'src/domain/entities/user_entity';
import { AuthUser } from 'src/domain/auth_user_decorator';
import { AuthenticatedUserGuard } from 'src/guards/authenticated_user_guard';

@Controller('customer-support')
@UseGuards(AuthenticatedUserGuard)
@ApiTags('customer-support')
@ApiBearerAuth(Constants.swaggerBearerAuth)
export class CustomerSupportController {
    constructor(private readonly customerSupportService: CustomerSupportService) {}

    @Post('')

    //generate documentation
    @ApiOperation({
        description: 'Contact customer service',
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
    @ApiBody({
        type: CustomerSupportDTO,
    })
    contact(
        @AuthUser() user: UserEntity,
        @Body() body: CustomerSupportDTO,
    ): Promise<ResponseDto<string>> {
        return this.customerSupportService.contact(user.id, body);
    }
}
