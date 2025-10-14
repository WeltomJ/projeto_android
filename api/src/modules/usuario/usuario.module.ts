import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

@Module({
    providers: [UsuarioService, PrismaService],
    controllers: [UsuarioController]
})
export class UsuarioModule { }
