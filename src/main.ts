import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExceptionHandler } from './core/exception_handlers/exception_handler';
import { Status } from './domain/dtos/response_dto';
import { Constants, Strings } from './core/constants/constants';
import { v2 as cloudinary } from 'cloudinary';
import cron, { ScheduledTask } from 'node-cron';
import axios, { AxiosError } from 'axios';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: (origin, callback) => {
            return callback(null, true);
        },
    });

    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle(`${Strings.appName} API`)
        .setDescription('')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            Constants.swaggerBearerAuth,
        )
        .addGlobalResponse({
            status: 400,
            description: 'Failed',
            schema: {
                type: 'object',
                properties: new Status().toDoc(),
            },
        })
        .build();

    app.setGlobalPrefix('api/v1', {
        exclude: [{ path: '/', method: RequestMethod.GET }],
    });
    app.useGlobalFilters(new ExceptionHandler(app.get(HttpAdapterHost)));

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document, {
        swaggerOptions: {
            useGlobalPrefix: true,
            persistAuthorization: true,
        },
    });

    cloudinary.config({
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        hide_sensitive: true,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });

    await app.listen(process.env.PORT ?? 5001, () => {
        const baseUrl = `http://localhost:${process.env.PORT ?? 3000}/api/v1`;
        console.log(`Server running on port ${baseUrl}`);
        console.log(`Documentation running on ${baseUrl}/docs`);
    });

    // const cronJob = cron.schedule('*/5 * * * * *', async () => {
    //     try {
    //         const response = await axios.get('https://locstream.onrender.com/');
    //         console.log('cron running ', response.data);
    //     } catch (e) {
    //         const error = e as AxiosError;

    //         console.log('error in cron job', error.message);
    //     }
    // });

    // console.log('cron initialized with id', cronJob.id);
}

bootstrap();
