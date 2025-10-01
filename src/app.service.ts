import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseDto, Status } from './domain/dtos/response_dto';

@Injectable()
export class AppService {
    getHello(): ResponseDto<string> {
        return new Status<string>().success('Server is up', HttpStatus.OK);
    }
}
