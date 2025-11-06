import { Module } from '@nestjs/common';
import { AmenidadeController } from './amenidade.controller';
import { AmenidadeService } from './amenidade.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [AmenidadeController],
    providers: [AmenidadeService, PrismaService],
    exports: [AmenidadeService],
})
export class AmenidadeModule {}
