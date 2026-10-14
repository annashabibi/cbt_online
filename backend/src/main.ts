import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
    'https://cbt-online-seven.vercel.app',
    'https://cbt-online-cbt13.vercel.app',
    'http://localhost:5173',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0');
}

bootstrap();