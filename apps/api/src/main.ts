import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { normalizeBracketQueryParams } from './common/middleware/normalize-query.middleware.js';
import { setupApiDocs } from './swagger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(normalizeBracketQueryParams);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  setupApiDocs(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Scalar docs: http://localhost:${port}/docs`);
  console.log(`Swagger UI: http://localhost:${port}/swagger`);
}

await bootstrap();
