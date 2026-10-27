import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function crearAplicacion() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'https://frontfloppy.vercel.app',
      'https://floppypet.vercel.app',
    ],
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

// Vercel llama esta función por cada solicitud, sin abrir un puerto propio.
// La promesa se comparte para iniciar Nest y la conexión a Mongo una sola vez
// por instancia, incluso si llegan varias solicitudes juntas.
let aplicacion: Promise<NestExpressApplication> | undefined;

export default async function handler(req: Request, res: Response) {
  aplicacion ??= crearAplicacion();
  const app = await aplicacion;
  return app.getHttpAdapter().getInstance()(req, res);
}

// En nuestra PC seguimos ejecutando el servidor con npm run start:dev.
if (!process.env['VERCEL']) {
  crearAplicacion()
    .then(app => app.listen(process.env['PORT'] || 3000))
    .catch(error => {
      console.error('No se pudo iniciar el backend:', error);
      process.exitCode = 1;
    });
}
