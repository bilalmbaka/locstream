import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import jwt from 'jsonwebtoken';
import { UserEntity } from 'src/domain/entities/user_entity';

@Injectable()
export class AuthTokenService {
    constructor(private configService: ConfigService) {}

    decode(token: string): any {
        const jwtSecret = this.configService.get<string>('JWT_SECRET');

        const payload = jwt.verify(token, jwtSecret) as any;

        return payload;
    }

    hasExpired(token: string): boolean {
        const decoded = jwt.decode(token) as { exp: number } | null;

        return !decoded || (decoded && decoded.exp * 1000 < Date.now());
    }

    generateFreshTokens(user: UserEntity): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign(
            {
                id: user.id,
            },
            this.configService.get<string>('JWT_SECRET'),
            { expiresIn: '1m' },
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
            },
            this.configService.get<string>('JWT_REFRESH_SECRET'),
            { expiresIn: '90d' },
        );

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }
}
