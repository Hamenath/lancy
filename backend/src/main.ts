import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Lancy Backend API running on http://localhost:${port}`);
  console.log(`📚 Swagger Documentation at http://localhost:${port}/api/docs`);
}
bootstrap();
