import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';

@Controller('avaliacao')
export class AvaliacaoController {
    constructor(private avaliacaoService: AvaliacaoService) { }

    @Post()
    criar(@Body() data: any) {
        return this.avaliacaoService.criar(data);
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.avaliacaoService.buscarPorId(+id);
    }

    @Get('local/:localId')
    listarPorLocal(@Param('localId') localId: string) {
        return this.avaliacaoService.listarPorLocal(+localId);
    }

    @Get('usuario/:usuarioId')
    listarPorUsuario(@Param('usuarioId') usuarioId: string) {
        return this.avaliacaoService.listarPorUsuario(+usuarioId);
    }

    @Get('local/:localId/media')
    obterMediaLocal(@Param('localId') localId: string) {
        return this.avaliacaoService.obterMediaLocal(+localId);
    }

    @Put(':id')
    atualizar(@Param('id') id: string, @Body() data: any) {
        return this.avaliacaoService.atualizar(+id, data);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.avaliacaoService.remover(+id);
    }
}