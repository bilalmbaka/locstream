import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailDTO {
    to: string;
    subject: string;
    content: string;
}

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASSWORD'),
            },
        });
    }

    async sendMail(dto: EmailDTO): Promise<void> {
        try {
            console.log(
                'Sending mil to ',
                dto.to,
                this.configService.get<string>('EMAIL_USER'),
                this.configService.get<string>('EMAIL_PASSWORD'),
            );

            await this.transporter.sendMail({
                from: {
                    name: this.configService.get<string>('EMAIL_SENDER'),
                    address: this.configService.get<string>('EMAIL_FROM'),
                },
                to: dto.to,
                Subject: dto.subject,
                html: dto.content,
            });
        } catch (error) {
            console.error('Failed to send mail', error);
            //Add to logger.
            //Fail silently
        }
    }
}
