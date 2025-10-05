import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CustomerSupportDTO {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    body: string;
}