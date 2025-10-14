import { Module } from '@nestjs/common';
import { LembreteController } from './lembrete.controller';
import { LembreteService } from './lembrete.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [LembreteController],
    providers: [LembreteService, PrismaService],
})
export class LembreteModule { }