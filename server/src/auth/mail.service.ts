import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });
    }

    async sendPasswordReset(email: string, name: string, resetUrl: string): Promise<void> {
        const mailOptions = {
            from: `"C++ Платформа" <${this.configService.get<string>('MAIL_USER')}>`,
            to: email,
            subject: 'Скидання пароля — C++ Платформа',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; background: #0b0f1a; margin: 0; padding: 0; }
                        .wrapper { max-width: 600px; margin: 40px auto; background: #161b26; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
                        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 40px 40px 32px; text-align: center; }
                        .header h1 { color: #fff; font-size: 28px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.5px; }
                        .header p { color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; }
                        .body { padding: 40px; }
                        .body p { color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 20px; }
                        .body p span { color: #e2e8f0; font-weight: 600; }
                        .btn-wrap { text-align: center; margin: 32px 0; }
                        .btn { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; }
                        .note { color: #64748b !important; font-size: 13px !important; margin-top: 24px !important; }
                        .footer { padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
                        .footer p { color: #475569; font-size: 12px; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>C++ Платформа</h1>
                            <p>КНУ · Інженерія програмного забезпечення</p>
                        </div>
                        <div class="body">
                            <p>Привіт, <span>${name || email}</span>!</p>
                            <p>Ми отримали запит на скидання пароля для вашого акаунта. Натисніть кнопку нижче, щоб встановити новий пароль:</p>
                            <div class="btn-wrap">
                                <a href="${resetUrl}" class="btn">Скинути пароль</a>
                            </div>
                            <p class="note">Посилання дійсне протягом <strong>1 години</strong>. Якщо ви не надсилали цей запит — просто проігноруйте цей лист.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 C++ Платформа · КНУ</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${email}`, error);
            throw error;
        }
    }

    async sendInvitation(email: string, name: string, setupUrl: string): Promise<void> {
        const mailOptions = {
            from: `"C++ Платформа" <${this.configService.get<string>('MAIL_USER')}>`,
            to: email,
            subject: 'Запрошення до C++ Платформи',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; background: #0b0f1a; margin: 0; padding: 0; }
                        .wrapper { max-width: 600px; margin: 40px auto; background: #161b26; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
                        .header { background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 40px 40px 32px; text-align: center; }
                        .header h1 { color: #fff; font-size: 28px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.5px; }
                        .header p { color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; }
                        .body { padding: 40px; }
                        .body p { color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 20px; }
                        .body p span { color: #e2e8f0; font-weight: 600; }
                        .btn-wrap { text-align: center; margin: 32px 0; }
                        .btn { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; }
                        .note { color: #64748b !important; font-size: 13px !important; margin-top: 24px !important; }
                        .footer { padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
                        .footer p { color: #475569; font-size: 12px; margin: 0; }
                    </style>
                </head>
                <body>
                    <div class="wrapper">
                        <div class="header">
                            <h1>C++ Платформа</h1>
                            <p>Запрошення до лав викладачів</p>
                        </div>
                        <div class="body">
                            <p>Вітаємо!</p>
                            <p>Вас було запрошено до освітньої платформи <span>C++ Платформа</span> як викладача. Для завершення реєстрації та встановлення пароля натисніть кнопку нижче:</p>
                            <div class="btn-wrap">
                                <a href="${setupUrl}" class="btn">Активувати акаунт</a>
                            </div>
                            <p class="note">Це посилання дійсне протягом <strong>24 годин</strong>. Якщо ви не очікували цього запрошення — просто проігноруйте цей лист.</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 C++ Платформа · КНУ</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Invitation email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send invitation email to ${email}`, error);
            throw error;
        }
    }
}
