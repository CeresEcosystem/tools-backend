import { INestApplication, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import {
  TelegramLogger,
  LoggingInterceptor,
  HttpExceptionFilter,
  NotFoundExceptionFilter,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

const DEV_ENV = 'dev';
const STANDARD_LOG_LEVELS: LogLevel[] = ['log', 'warn', 'error'];
const DEBUG_LOG_LEVELS: LogLevel[] = ['debug', 'verbose'];

const INTERCEPTOR_URL_THRESHOLDS = [
  {
    url: '/api/swaps',
    warn: 5000,
    error: 15000,
  },
  {
    url: '/api/portfolio',
    warn: 10000,
    error: 20000,
  },
  {
    url: '/api/tracker',
    warn: 5000,
    error: 15000,
  },
  {
    url: '/api/trading/history',
    warn: 5000,
    error: 15000,
  },
];

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // waits for TelegramLogger to be instantiated
  });

  setupLogger(app);

  app.enableCors();

  app.useGlobalInterceptors(new LoggingInterceptor(INTERCEPTOR_URL_THRESHOLDS));

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

function setupLogger(app: INestApplication): void {
  // https://docs.nestjs.com/techniques/logger#dependency-injection
  // Use TelegramLogger only if env variables are set
  if (
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_ERROR_CHAT_ID &&
    process.env.TELEGRAM_WARN_CHAT_ID
  ) {
    app.useLogger(app.get(TelegramLogger));
  } else {
    app.useLogger(
      process.env.LOG_DEBUG
        ? STANDARD_LOG_LEVELS.concat(DEBUG_LOG_LEVELS)
        : STANDARD_LOG_LEVELS,
    );
  }
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
