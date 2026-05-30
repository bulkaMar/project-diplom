import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — enforces class-validator decorators on all DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // strip unknown fields
    forbidNonWhitelisted: false,
    transform: true,
    stopAtFirstError: false, // collect all errors at once
  }));

  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // Local network — allows any 192.168.x.x or 10.x.x.x client on ports 3000-3005
    /^http:\/\/192\.168\.\d+\.\d+:(3000|3001|3002|3003|3004|3005)$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:(3000|3001|3002|3003|3004|3005)$/,
  ];

  // Production / staging origins from environment variable
  // Supports multiple comma-separated URLs: "https://app.vercel.app,https://custom-domain.com"
  if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(',').forEach((url) => {
      const trimmed = url.trim();
      if (trimmed) allowedOrigins.push(trimmed);
    });
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();


