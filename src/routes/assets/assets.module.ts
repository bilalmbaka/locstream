import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsEntity } from 'src/domain/entities/assets_entity';

@Module({
    imports: [TypeOrmModule.forFeature([AssetsEntity])],
    controllers: [AssetsController],
    providers: [AssetsService],
    exports: [AssetsService],
})
export class AssetsModule {}
