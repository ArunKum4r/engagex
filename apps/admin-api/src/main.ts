import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const swaggerCfg = new DocumentBuilder()
    .setTitle('EngageX Admin API')
    .setDescription('EngageX Admin API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerCfg);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.ADMIN_API_PORT ?? 3001);
};

bootstrap();