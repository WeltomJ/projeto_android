import { Module } from '@nestjs/common';
import { LocadorController } from './locador.controller';
import { LocadorService } from './locador.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [LocadorController],
    providers: [LocadorService, PrismaService],
})
export class LocadorModule { }