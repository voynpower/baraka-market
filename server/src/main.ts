// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Static Assets Configuration (CRITICAL FIX)
  // This makes the 'uploads' folder in the server root accessible via 'http://localhost:3000/uploads/...'
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 2. CORS Configuration (Allow everything for local dev)
  app.enableCors();

  // 2. Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 3. Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Baraka Market API')
    .setDescription('The Baraka Market E-commerce API Description')
    .setVersion('1.0')
    .addTag('products')
    .addTag('orders')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 4. Start Server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📄 API Documentation: http://localhost:${port}/api`);
}
bootstrap();
