import { ApiProperty } from '@nestjs/swagger';

export class Asset {
    @ApiProperty()
    id: string;

    @ApiProperty()
    url: string;

    @ApiProperty()
    thumbnail?: string;

    @ApiProperty()
    gif?: string;

    @ApiProperty()
    size?: number;

    @ApiProperty()
    mime?: string;
}
