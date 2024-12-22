import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: WinstonModule.createLogger(loggerConfig)
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
