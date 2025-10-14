import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { LocadorModule } from './modules/locador/locador.module';
import { LocalModule } from './modules/local/local.module';
import { AvaliacaoModule } from './modules/avaliacao/avaliacao.module';
import { LembreteModule } from './modules/lembrete/lembrete.module';
import { FavoritoModule } from './modules/favorito/favorito.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtMiddleware } from './middleware/JwtMiddleware';

@Module({
    imports: [
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
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtMiddleware).exclude('auth/login', 'usuario/register').forRoutes('*');
    }
}