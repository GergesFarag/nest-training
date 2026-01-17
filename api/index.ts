import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';

let cachedServer: express.Express;

async function bootstrap(): Promise<express.Express> {
  if (!cachedServer) {
    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.setGlobalPrefix('api/v1');
    app.use(helmet({}));
    app.enableCors({
      origin: '*',
    });
    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  const server = await bootstrap();
  server(req, res);
}
