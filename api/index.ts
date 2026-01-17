import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';

let cachedServer;
async function bootstrap() {
  if (!cachedServer) {
    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    app.setGlobalPrefix('api/v1');

    app.use(helmet({}));
    app.enableCors({
      origin: 'http://localhost:3000',
    });
    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}
export default bootstrap;
