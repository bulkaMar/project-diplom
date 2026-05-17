import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;
    private currentApiKey: string | null = null;
    private model: any;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) { }

    private async getModel() {
        try {
            const config = await this.prisma.systemConfig.findUnique({
                where: { id: 'global' },
            });

            const apiKey = config?.geminiApiKey || this.configService.get<string>('GEMINI_API_KEY');

            if (!apiKey) {
                this.logger.warn('No Gemini API key found in DB or ENV.');
                return null;
            }

            if (config && !config.adviceSystemActive) {
                return null; // System is disabled
            }

            if (apiKey !== this.currentApiKey || !this.model) {
                this.currentApiKey = apiKey;
                this.genAI = new GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
            }

            return this.model;
        } catch (error) {
            this.logger.error('Error fetching model config:', error);
            // Fallback to env if DB fails
            const apiKey = this.configService.get<string>('GEMINI_API_KEY');
            if (apiKey && !this.model) {
                this.genAI = new GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
            }
            return this.model;
        }
    }

    async generateHint(code: string, errorType: string, expectedOutput: string, actualOutput: string, lessonContent: string): Promise<string> {
        const activeModel = await this.getModel();
        
        if (!activeModel) {
            return 'ШІ-підказки тимчасово вимкнено адміністратором або не налаштовано.';
        }

        const prompt = `
      Ти — професійний ментор з програмування на C++. 
      Студент розв'язує задачу, але його код не проходить тести.
      
      КОНТЕКСТ ЗАВДАННЯ:
      ${lessonContent}
      
      КОД СТУДЕНТА:
      \`\`\`cpp
      ${code}
      \`\`\`
      
      РЕЗУЛЬТАТ ТЕСТУ:
      - Помилка: ${errorType === 'FAILED' ? 'Невідповідність виводу' : 'Помилка виконання/компіляції'}
      - Очікувалось: "${expectedOutput}"
      - Отримано: "${actualOutput}"
      
      ЗАВДАННЯ:
      Напиши коротку пораду (1-2 речення) українською мовою. 
      НЕ ДАВАЙ готовий код. 
      НЕ КАЖИ прямо "виправте це на те". 
      Дай підказку, що допоможе студенту самому зрозуміти помилку (наприклад, зверни увагу на типи даних, пропущений оператор, або формат виводу).
      Почни пораду словами "💡 Порада: ..."
    `;

        try {
            const result = await activeModel.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            this.logger.error('Error generating AI hint:', error);
            return 'Не вдалося згенерувати підказку. Спробуйте проаналізувати очікуваний вивід самостійно.';
        }
    }
}
