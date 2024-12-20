import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { linkToDatabase } from './utils/db.util';
const env = process.env;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'https://dev.peq.us',
      'https://peq.us',
      'https://portal.peq.us',
      'https://api.peq.us',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Set-Cookie'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  const config = new DocumentBuilder()
    .setTitle('PeQ API')
    .setDescription('PeQ API')
    .setVersion('1.0')
    .addTag('peq')
    .addCookieAuth('sessionId')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await linkToDatabase();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('PeQ API Application Started');
  })
  .catch((e) => {
    console.log('Failed to start PeQ API\n', e);
  });
