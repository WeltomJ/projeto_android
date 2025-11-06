import { Controller, Get } from '@nestjs/common';
import { AmenidadeService } from './amenidade.service';

@Controller('amenidade')
export class AmenidadeController {
    constructor(private readonly amenidadeService: AmenidadeService) {}

    @Get()
    async listar() {
        try {
            console.log('🔍 Buscando amenidades...');
            const amenidades = await this.amenidadeService.listar();
            console.log(`✅ ${amenidades.length} amenidades encontradas`);
            return amenidades;
        } catch (error) {
            console.error('❌ Erro ao buscar amenidades:', error);
            throw error;
        }
    }
}
