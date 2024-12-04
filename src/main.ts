import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

const env = process.env;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [],
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
  
    
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {console.log("PeQ API Application Started")})
  .catch((e) => {console.log("Failed to start PeQ API\n", e)});