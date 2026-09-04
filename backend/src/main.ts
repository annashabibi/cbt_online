import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

app.enableCors({
  origin: [
    'https://cbt-online-seven.vercel.app',
    'https://cbt-online-cbt12.vercel.app',
    'http://localhost:5173',
  ],
});

  await app.listen(3000);
}

bootstrap();