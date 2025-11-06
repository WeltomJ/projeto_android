import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LocalService } from './local.service';
import { CriarLocalDto } from './dto/criar-local.dto';
import { AtualizarLocalDto } from './dto/atualizar-local.dto';

@Controller('local')
export class LocalController {
    constructor(private localService: LocalService) { }

    @Post()
    criar(@Body() data: CriarLocalDto) {
        return this.localService.criar(data);
    }

    @Get()
    listar(@Query('cidade') cidade?: string, @Query('estado') estado?: string) {
        return this.localService.listar({ cidade, estado });
    }

    @Get('proximidade')
    buscarPorProximidade(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
        @Query('raio') raio?: string,
    ) {
        return this.localService.buscarPorProximidade(+lat, +lng, raio ? +raio : 5);
    }

    @Get('locador/:locadorId')
    buscarPorLocador(@Param('locadorId') locadorId: string) {
        return this.localService.buscarPorLocador(+locadorId);
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.localService.buscarPorId(+id);
    }

    @Put(':id')
    atualizar(@Param('id') id: string, @Body() data: AtualizarLocalDto) {
        return this.localService.atualizar(+id, data);
    }

    @Post(':id/media')
    adicionarMedia(@Param('id') id: string, @Body() data: { url: string; tipo: 'IMG' | 'VID'; ordem: number }) {
        return this.localService.adicionarMedia(+id, data);
    }

    @Delete(':id/media/:mediaId')
    removerMedia(@Param('id') id: string, @Param('mediaId') mediaId: string) {
        return this.localService.removerMedia(+id, +mediaId);
    }

    @Put(':id/redes')
    atualizarRedes(@Param('id') id: string, @Body() data: { instagram?: string; facebook?: string; whatsapp?: string }) {
        return this.localService.atualizarRedes(+id, data);
    }

    @Get(':id/horario')
    listarHorarios(@Param('id') id: string) {
        return this.localService.listarHorarios(+id);
    }

    @Post(':id/horario')
    adicionarHorario(@Param('id') id: string, @Body() data: { dia: number; hora_abertura: string; hora_fechamento: string; fechado: boolean }) {
        return this.localService.adicionarHorario(+id, data);
    }

    @Put(':id/horario/:horarioId')
    atualizarHorario(
        @Param('id') id: string,
        @Param('horarioId') horarioId: string,
        @Body() data: { dia?: number; hora_abertura?: string; hora_fechamento?: string; fechado?: boolean }
    ) {
        return this.localService.atualizarHorario(+id, +horarioId, data);
    }

    @Delete(':id/horario/:horarioId')
    removerHorario(@Param('id') id: string, @Param('horarioId') horarioId: string) {
        return this.localService.removerHorario(+id, +horarioId);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.localService.remover(+id);
    }
}