// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Static Assets Configuration
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 2. FULL CORS OPEN (For Local Testing)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Baraka Market API')
    .setDescription('The Baraka Market E-commerce API Description')
    .setVersion('1.0')
    .addBearerAuth() // Add this for JWT testing in Swagger
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 5. Start Server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 NestJS Server is ready at: http://localhost:${port}`);
  console.log(`📄 Swagger Docs at: http://localhost:${port}/api`);
}
bootstrap();
