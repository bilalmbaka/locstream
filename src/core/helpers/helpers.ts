import { BadRequestException } from '@nestjs/common';

export class Helpers {
    static swaggerDocPath(objectName: string): string {
        return `#components/schemas/${objectName}`;
    }

    static generateUserName(email: string): string {
        const minLength = 4;
        const maxLength = 6;

        // Clean the inputs
        const emailPrefix = email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        // Generate random username with length between 4 and 6 using tempUserName as source
        return this.generateRandomFromSource(emailPrefix, minLength, maxLength);
    }

    private static generateRandomFromSource(
        source: string,
        minLength: number,
        maxLength: number,
    ): string {
        // If source is empty or too short, add some default characters
        if (source.length === 0 || source.length < minLength) {
            source = 'abcdefghijklmnopqrstuvwxyz0123456789';
        }

        // Generate random length between min and max
        const targetLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

        let result = '';

        // Pick random characters from the source string
        for (let i = 0; i < targetLength; i++) {
            const randomIndex = Math.floor(Math.random() * source.length);
            result += source.charAt(randomIndex);
        }

        return result;
    }

    static validatePagination(start?: string, end?: string) {
        if (start && Number(start) < 0) throw new BadRequestException('Invalid start pagination');

        if (start && end) {
            if (Number(start) > Number(end))
                throw new BadRequestException(
                    'Start pagination cannot be greater than end pagination',
                );
            if (Number(end) - Number(start) > 100)
                throw new BadRequestException('Pagination gap too large');
        }
    }

    static generateOtp(): string {
        let otp = '';
        const source = '0123456789';

        while (otp.length < 4) {
            otp = `${otp}${source.charAt(Math.floor(Math.random() * source.length))}`;
        }

        return otp;
    }
}
