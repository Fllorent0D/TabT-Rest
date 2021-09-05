import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as responseTime from 'response-time';
import { TabtExceptionsFilter } from './common/filter/tabt-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { PackageService } from './common/package/package.service';
import {tracer} from 'dd-trace';
import { StatsD } from 'hot-shots';
import { DatadogService } from './common/logger/datadog.service';
//import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  //const logger = await app.resolve(LogtailLogger)
  //app.useLogger(logger);

  const packageService = app.get(PackageService);
  const datadog = app.get(DatadogService);
  app.setGlobalPrefix(process.env.API_PREFIX);

  const options = new DocumentBuilder()
    .setTitle('TabT Rest')
    .setDescription('This api is a bridge to the TabT SOAP API. It contacts TabT and cache results in order to reduce latency for some requests. More documentation will come.')
    .setVersion('1.0')
    .setContact('Florent Cardoen', 'http://floca.be/', 'f.cardoen@me.com')
    .setVersion(packageService.version)
    .setLicense('GNU General Public License v3.0', 'https://github.com/Fllorent0D/TabT-Rest/blob/main/LICENSE')
    .addTag('Seasons')
    .addTag('Clubs')
    .addTag('Members')
    .addTag('Matches')
    .addTag('Divisions')
    .addTag('Tournaments')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(process.env.API_PREFIX, app, document);
  tracer.init();
  app.use(compression());
  app.use(helmet());
  app.use(responseTime());

  app.useGlobalFilters(new TabtExceptionsFilter(datadog));
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT);
}

bootstrap();
