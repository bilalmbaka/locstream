import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Strings } from 'src/core/constants/constants';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { CustomerSupportDTO } from 'src/domain/dtos/customer_support_dto';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { CustomerSupportEntity } from 'src/domain/entities/customer_support_entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerSupportService {
    constructor(
        @InjectRepository(CustomerSupportEntity)
        private customerSupportRepository: Repository<CustomerSupportEntity>,
    ) {}

    async contact(userId: string, dto: CustomerSupportDTO): Promise<ResponseDto<string>> {
        try {
            await this.customerSupportRepository.save({
                title: dto.title,
                body: dto.body,
                user: {
                    id: userId,
                },
            } as CustomerSupportEntity);

            return new Status<string>().success(Strings.successString, HttpStatus.OK);
        } catch (e) {
            throw DBExceptionHandler.handleException(e);
        }
    }
}
