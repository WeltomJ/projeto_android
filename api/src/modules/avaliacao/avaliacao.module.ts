import { Module } from '@nestjs/common';
import { AvaliacaoController } from './avaliacao.controller';
import { AvaliacaoService } from './avaliacao.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [AvaliacaoController],
    providers: [AvaliacaoService, PrismaService],
})
export class AvaliacaoModule { }