import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AIChatDTO {
    @ApiProperty({
        example: "What is my balance?.",
    })
    @IsString()
    message: string;
}