import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SubmissionsService {
    private readonly logger = new Logger(SubmissionsService.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private aiService: AiService,
    ) { }

    async run(lessonId: string, code: string): Promise<{ cases: { index: number; input: string; stdout: string; stderr: string; expected: string; passed: boolean; exitCode: number }[] }> {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
        const testCases = ((lesson?.testCases as any[]) || []).slice(0, 3); // Show max 3 cases like LeetCode

        const apiUrl = this.configService.get<string>('GODBOLT_API_URL') || 'https://godbolt.org/api/compiler/g122/compile';
        const cases: { index: number; input: string; stdout: string; stderr: string; expected: string; passed: boolean; exitCode: number }[] = [];

        for (let i = 0; i < testCases.length; i++) {
            const test = testCases[i];
            try {
                const response = await axios.post(apiUrl, {
                    source: code,
                    options: {
                        userArguments: '',
                        compilerOptions: { executorRequest: true },
                        filters: { execute: true },
                        executeParameters: { stdin: test.input ?? '' },
                    },
                }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });

                const result = response.data;
                const actualStdout = result.stdout?.map((l: any) => l.text).join('\n').trim() || '';
                const expectedOutput = (test.output || '').toString().trim();
                const passed = result.code === 0 && actualStdout === expectedOutput;

                cases.push({
                    index: i + 1,
                    input: test.input ?? '',
                    stdout: actualStdout,
                    stderr: result.stderr?.map((l: any) => l.text).join('\n') || '',
                    expected: expectedOutput,
                    passed: passed,
                    exitCode: result.code ?? 0,
                });
            } catch (err: any) {
                cases.push({ index: i + 1, input: test.input ?? '', stdout: '', stderr: err.message, expected: test.output || '', passed: false, exitCode: 1 });
            }
        }

        return { cases };
    }

    async submit(lessonId: string, userId: string, code: string) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) throw new NotFoundException('Lesson not found');

        const apiUrl = this.configService.get<string>('GODBOLT_API_URL') || 'https://godbolt.org/api/compiler/g122/compile';

        const testCases = (lesson.testCases as any[]) || [];
        let status: 'PASSED' | 'FAILED' | 'ERROR' = 'PASSED';
        let output = '';
        let hint = '';
        let expected = '';
        let actual = '';

        // Track per-test results for the UI
        const testResults: { index: number; input: string; expected: string; actual: string; passed: boolean }[] = [];

        try {
            this.logger.log(`Starting Godbolt submission for user ${userId} on lesson ${lessonId}`);

            let lastStdout = '';

            for (let i = 0; i < testCases.length; i++) {
                const test = testCases[i];
                const submissionData = {
                    source: code,
                    options: {
                        userArguments: "",
                        compilerOptions: { executorRequest: true },
                        filters: { execute: true },
                        executeParameters: { stdin: test.input }
                    }
                };

                const response = await axios.post(apiUrl, submissionData, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                });

                const result = response.data;
                const actualStdout = result.stdout?.map((line: any) => line.text).join('\n').trim() || '';
                const actualStderr = result.stderr?.map((line: any) => line.text).join('\n').trim() || '';
                const expectedOutput = test.output.trim();

                // 1. Check for compilation or runtime errors (exit code != 0)
                if (result.code !== 0) {
                    status = 'FAILED';
                    const errorMsg = actualStderr || (result.stdout?.map((l: any) => l.text).join('\n')) || 'Невідома помилка виконання';
                    output = `Помилка (код ${result.code}):\n${errorMsg}`;
                    testResults.push({ index: i + 1, input: test.input, expected: expectedOutput, actual: errorMsg, passed: false });
                    
                    expected = expectedOutput;
                    actual = errorMsg;
                    hint = await this.aiService.generateHint(code, 'ERROR', expectedOutput, errorMsg, lesson.content);
                    break;
                }

                // 2. Compare output
                const passed = actualStdout === expectedOutput;
                this.logger.debug(`Case ${i + 1}: expected="${expectedOutput}", actual="${actualStdout}", passed=${passed}`);

                testResults.push({ index: i + 1, input: test.input, expected: expectedOutput, actual: actualStdout, passed });

                if (passed) {
                    lastStdout = actualStdout;
                } else {
                    status = 'FAILED';
                    output = `Тест не пройдено\nВхідні дані: ${test.input}\nОчікувалось: ${expectedOutput}\nОтримано: ${actualStdout}`;
                    expected = expectedOutput;
                    actual = actualStdout;

                    hint = await this.aiService.generateHint(code, 'FAILED', expectedOutput, actualStdout, lesson.content);
                    break;
                }
            }

            if (status === 'PASSED') {
                output = `Всі тести пройдено! \n\nВаш результат:\n${lastStdout.trim() || 'Результату немає'}`;
                this.logger.log(`Submission for user ${userId} passed.`);

                await this.prisma.progress.upsert({
                    where: { userId_lessonId: { userId, lessonId } },
                    create: { userId, lessonId, completed: true, score: 100 },
                    update: { completed: true, score: 100 }
                });
            } else if (status === 'FAILED') {
                this.logger.log(`Submission for user ${userId} failed.`);
                
                await this.prisma.progress.upsert({
                    where: { userId_lessonId: { userId, lessonId } },
                    create: { userId, lessonId, completed: false, score: 0 },
                    update: { completed: false, score: 0 }
                });
            }

        } catch (error: any) {
            this.logger.error(`Godbolt execution error:`, error.response?.data || error.message);
            status = 'ERROR';
            output = `Помилка виконання: ${error.message}. Будь ласка, спробуйте пізніше.`;
        }

        const submission = await this.prisma.submission.create({
            data: { code, status, output, hint, userId, lessonId }
        });
        return { ...submission, expected, actual, testResults };
    }

    async runAgainstCases(code: string, testCases: any[]): Promise<{ cases: any[] }> {
        const apiUrl = this.configService.get<string>('GODBOLT_API_URL') || 'https://godbolt.org/api/compiler/g122/compile';
        const cases: any[] = [];

        for (let i = 0; i < testCases.length; i++) {
            const test = testCases[i];
            try {
                const response = await axios.post(apiUrl, {
                    source: code,
                    options: {
                        userArguments: '',
                        compilerOptions: { executorRequest: true },
                        filters: { execute: true },
                        executeParameters: { stdin: test.input ?? '' },
                    },
                }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } });

                const result = response.data;
                const actualStdout = result.stdout?.map((l: any) => l.text).join('\n').trim() || '';
                const expectedOutput = (test.output || '').toString().trim();
                const passed = result.code === 0 && actualStdout === expectedOutput;

                cases.push({
                    index: i + 1,
                    input: test.input ?? '',
                    stdout: actualStdout,
                    stderr: result.stderr?.map((l: any) => l.text).join('\n') || '',
                    expected: expectedOutput,
                    passed: passed,
                    exitCode: result.code ?? 0,
                });
            } catch (err: any) {
                cases.push({ index: i + 1, input: test.input ?? '', stdout: '', stderr: err.message, expected: test.output || '', passed: false, exitCode: 1 });
            }
        }
        return { cases };
    }
}

