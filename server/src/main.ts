// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS Configuration (Enable requests from Frontend)
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
