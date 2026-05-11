import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface EmailDTO {
    to: string;
    subject: string;
    content: string;
}

@Injectable()
export class EmailService {
    async sendMail(dto: EmailDTO): Promise<void> {
        try {
            const body = JSON.stringify({
                to: dto.to,
                subject: dto.subject,
                body: dto.content,
                from: process.env.EMAIL_FROM,
            });
            const header = {
                Authorization: `Bearer ${process.env.EMAIL_SECRET_KEY!}`,
                'Content-Type': 'application/json',
            };

            console.log('body is', body);
            console.log('header is header', header);

            await axios.post('https://next-api.useplunk.com/v1/send', body, {
                headers: header,
            });
        } catch (e) {
            console.log('Error sending mail', e);
        }
    }
}
