import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from '../modules/usuario/usuario.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtMiddleware } from './jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.JWT_EXPIRES as any },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UsuarioService, PrismaService, JwtMiddleware],
    exports: [AuthService]
})
export class AuthModule { }
