import { All, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseDto } from './domain/dtos/response_dto';

@Controller('/')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/')
    getHello(): ResponseDto<string> {
        return this.appService.getHello();
    }
}
