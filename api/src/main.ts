import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('API_VERSION') || '1',
  });

  // CORS
  app.enableCors({
    origin: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AskChimps API')
    .setDescription(
      'AskChimps API - Multi-platform chat management and lead tracking system',
    )
    .setVersion('1.0')
    .setContact(
      'AskChimps Support',
      'https://askchimps.com',
      'support@askchimps.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:4022', 'Development')
    .addServer('https://api.askchimps.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AskChimps API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  });

  const port = configService.get<number>('PORT') || 4022;
  const apiVersion = configService.get<string>('API_VERSION') || '1';
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Version: v${apiVersion}`);
  console.log(`Versioned endpoints: http://localhost:${port}/v${apiVersion}/*`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
