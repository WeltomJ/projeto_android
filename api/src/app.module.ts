import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { LocadorModule } from './modules/locador/locador.module';
import { LocalModule } from './modules/local/local.module';
import { AvaliacaoModule } from './modules/avaliacao/avaliacao.module';
import { LembreteModule } from './modules/lembrete/lembrete.module';
import { FavoritoModule } from './modules/favorito/favorito.module';
import { UploadModule } from './modules/upload/upload.module';
import { AmenidadeModule } from './modules/amenidade/amenidade.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtMiddleware } from './middleware/JwtMiddleware';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret-key-change-in-production',
            signOptions: { expiresIn: '1h' },
        }),
        AuthModule,
        UsuarioModule,
        LocadorModule,
        LocalModule,
        AvaliacaoModule,
        LembreteModule,
        FavoritoModule,
        UploadModule,
        AmenidadeModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtMiddleware).exclude('auth/login', 'usuario/register', 'auth/google', 'locador/register').forRoutes('*');
    }
}