import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MysqlService } from './mysql/mysql.service';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log('🔧 Bootstrapping NestJS application...');

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'https://vascon-frontend.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allowedOrigin?: string | boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.enableCors(corsOptions);

  // ————————————————
  // 1. VERIFY RAW MYSQL CONNECTION
  // ————————————————
  const mysql = app.get(MysqlService);
  mysql.onModuleInit();

  try {
    const connection = await mysql.getConnection();
    await connection.ping(); // lightweight check
    console.log('✅ MySQL connection established');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }

  // ————————————————
  // 2. GLOBAL CONFIGURATION
  // ————————————————
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // // ———————————————— Swagger Configuration ————————————————

  // const config = new DocumentBuilder()
  //   .setTitle('Your API Title')
  //   .setDescription('Your API description here')
  //   .setVersion('1.0')
  //   .addTag('users') // Example tag
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api-docs', app, document);

  // ————————————————
  // 3. START SERVER
  // ————————————————
  const port = Number(process.env.PORT) || 5000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}

void bootstrap();
