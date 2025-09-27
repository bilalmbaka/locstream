import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
    @ApiProperty({
        description: 'Indicates if the request was successful',
        example: true,
        type: Boolean,
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Operation completed successfully',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'HTTP status code',
        example: 200,
        type: Number,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Response data (optional)',
        type: Object,
    })
    data?: T;
}

export class ErrorResponseDto {
    @ApiProperty({
        description: 'Indicates if the request was successful',
        example: true,
        type: Boolean,
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Operation failed',
        type: String,
    })
    message: string;

    @ApiProperty({
        description: 'HTTP status code',
        example: 400,
        type: Number,
    })
    statusCode: number;
}

export class Status<T> {
    success(message: string, statusCode: number, data?: T): ResponseDto<T> {
        return {
            success: true,
            message,
            statusCode,
            data,
        };
    }

    error(message: string, statusCode: number): ErrorResponseDto {
        return {
            success: false,
            message,
            statusCode,
        };
    }

    toDoc(
        examplePath?: String,
        exampleMessage?: String,
        exampleStatusCode?: number,
        dataReturnType?: string,
        success: boolean = false
    ): Record<string, any> {
        return examplePath
            ? {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Operation completed successfully' },
                  statusCode: { type: 'number', example: 200 },
                  data: {
                      type: dataReturnType,
                      $ref: dataReturnType === 'array' ? undefined : examplePath,
                      items:
                          dataReturnType === 'array'
                              ? {
                                    $ref: examplePath,
                                }
                              : null,
                  },
              }
            : {
                  success: { type: 'boolean', example: success },
                  message: { type: 'string', example: exampleMessage ?? 'Operation failed' },
                  statusCode: { type: 'number', example: exampleStatusCode ?? 400 },
              };
    }
}
