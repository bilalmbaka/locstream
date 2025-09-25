import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ResponseDto } from 'src/domain/dtos/response_dto';
import { DBException } from './db_exception_handler';
import { StorageException } from './storage_exception_handler';

//The exceptions that are caught by this handler
@Catch(HttpException, DBException)
export class ExceptionHandler implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();
        let httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = this.handleException(exception);

        if (responseBody.statusCode) {
            httpStatus = responseBody.statusCode;
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }

    handleException(error: unknown): ResponseDto<any> {
        // console.log('Exception caught =============> \n\n\n', error, '\n\n\n');

        if (error instanceof BadRequestException || error instanceof ForbiddenException) {
            const errorMessage = error.getResponse() as { message: string };

            return {
                success: false,
                message: errorMessage.message,
                statusCode:
                    error instanceof BadRequestException
                        ? HttpStatus.BAD_REQUEST
                        : HttpStatus.FORBIDDEN,
            };
        }

        if (error instanceof UnauthorizedException) {
            const errorMessage = error.getResponse() as { message: string };

            return {
                success: false,
                message: errorMessage.message,
                statusCode: HttpStatus.UNAUTHORIZED,
            };
        }

        if (error instanceof HttpException) {
            return {
                success: false,
                message: error.message,
                statusCode: HttpStatus.BAD_REQUEST,
            };
        }

        if (error instanceof DBException) {
            return {
                success: false,
                message: error.errorMessage,
                statusCode: HttpStatus.EXPECTATION_FAILED,
            };
        }

        if (error instanceof StorageException) {
            return {
                success: false,
                message: error.message,
                statusCode: HttpStatus.FAILED_DEPENDENCY,
            };
        }

        return {
            success: false,
            message: 'Internal server error',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
}
