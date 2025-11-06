import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AmenidadeService {
    constructor(private readonly prisma: PrismaService) {}

    async listar() {
        return this.prisma.amenidade.findMany({
            orderBy: { nome: 'asc' }
        });
    }
}
