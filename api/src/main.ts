import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port);
    const address = await app.getUrl();
    if (!process.env.APP_URL) {
        process.env.APP_URL = address.replace(/\/$/, '');
    }
}
bootstrap();
