import { Module } from '@nestjs/common';
import { CustomerSupportService } from './customer-support.service';
import { CustomerSupportController } from './customer-support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { CustomerSupportEntity } from 'src/domain/entities/customer_support_entity';
import { AuthTokenService } from 'src/core/services/token_service';

@Module({
    imports: [TypeOrmModule.forFeature([CustomerSupportEntity, AccessTokenEntity])],
    controllers: [CustomerSupportController],
    providers: [CustomerSupportService, AuthTokenService],
})
export class CustomerSupportModule {}
