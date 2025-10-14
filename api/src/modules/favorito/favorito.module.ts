import { Module } from '@nestjs/common';
import { FavoritoController } from './favorito.controller';
import { FavoritoService } from './favorito.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [FavoritoController],
    providers: [FavoritoService, PrismaService],
})
export class FavoritoModule { }