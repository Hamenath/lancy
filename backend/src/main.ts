import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Lancy API Gateway')
    .setDescription('Full-Stack Freelancer Marketplace Core REST API')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('freelancers')
    .addTag('projects')
    .addTag('proposals')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Lancy Backend API running on http://localhost:${port}`);
  console.log(`📚 Swagger Documentation at http://localhost:${port}/api/docs`);
}
bootstrap();
