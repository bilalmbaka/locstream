import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UserEntity } from './domain/entities/user_entity';
import { AccessTokenEntity } from './domain/entities/access_token_entity';
import { AssetsEntity } from './domain/entities/assets_entity';
import { AuthModule } from './routes/auth/auth.module';
import { PriviledgeUserModule } from './routes/users/admin/admin_user.module';
import { UsersModule } from './routes/users/user/users.module';
import { AssetsModule } from './routes/assets/assets.module';
import { UserLocationSubscriber } from './routes/share-location/user/location-subscriber';
import { ShareLocationModule } from './routes/share-location/user/share-location.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres' as const,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            synchronize: true,
            ssl: false,
            namingStrategy: new SnakeNamingStrategy(),
            entities: [UserEntity, AccessTokenEntity, AssetsEntity],
            subscribers: [UserLocationSubscriber],
        }),
        AuthModule,
        PriviledgeUserModule,
        UsersModule,
        AssetsModule,
        ShareLocationModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
