import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';
import { TelegramLogger } from './modules/logger/telegram-logger';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

const DEV_ENV = 'dev';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // waits for TelegramLogger to be instantiated
  });

  // https://docs.nestjs.com/techniques/logger#dependency-injection
  // Use TelegramLogger only if env variables are set
  if (
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_ERROR_CHAT_ID &&
    process.env.TELEGRAM_WARN_CHAT_ID
  ) {
    app.useLogger(app.get(TelegramLogger));
  }

  app.enableCors();

  app.useGlobalInterceptors(new LoggingInterceptor());

  // https://docs.nestjs.com/exception-filters#exception-filters-1
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new NotFoundExceptionFilter(),
  );

  // https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // https://docs.nestjs.com/faq/global-prefix
  app.setGlobalPrefix('api');

  // https://docs.nestjs.com/openapi/introduction
  if (process.env.APP_ENV === DEV_ENV) {
    const swaggerConfig = buildSwaggerConfig();
    const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/swagger', app, swaggerDoc);
  }

  await app.listen(process.env.PORT);
}

function buildSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('Tools Backend')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      in: 'Header',
    })
    .build();
}

bootstrap();
