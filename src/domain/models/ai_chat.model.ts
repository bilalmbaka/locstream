import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AIChat {
    @ApiProperty()
    @IsString()
    message: string;

    //Extend to let front end know about other things that are needed,
    //that are not text related, for example an image.
}
