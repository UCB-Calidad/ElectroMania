import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Configuration from './config/Configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import * as cookieParser from 'cookie-parser';

/* eslint-disable unicorn/prefer-top-level-await */
void (async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
  const config = new DocumentBuilder()
    .setTitle('Electromania')
    .setDescription('API de Compra y Venta de Productos Electrónicos')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );
  app.enableCors({
    origin: [
      Configuration().webSiteDomain.url,
      `${Configuration().webSiteDomain.url}:${Configuration().webSiteDomain.port}`,
      'http://localhost',
      'http://localhost:4200',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
})().catch((error: unknown) => {
  console.error('Failed to bootstrap application', error);
  process.exit(1);
});
/* eslint-enable unicorn/prefer-top-level-await */
