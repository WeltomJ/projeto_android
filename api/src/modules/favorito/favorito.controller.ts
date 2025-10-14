import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { FavoritoService } from './favorito.service';

@Controller('favorito')
export class FavoritoController {
    constructor(private favoritoService: FavoritoService) { }

    @Post()
    adicionar(@Body() data: { usuario_id: number; local_id: number }) {
        return this.favoritoService.adicionar(data);
    }

    @Get('usuario/:usuarioId')
    listarPorUsuario(@Param('usuarioId') usuarioId: string) {
        return this.favoritoService.listarPorUsuario(+usuarioId);
    }

    @Get('verificar/:usuarioId/:localId')
    verificar(@Param('usuarioId') usuarioId: string, @Param('localId') localId: string) {
        return this.favoritoService.verificar(+usuarioId, +localId);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.favoritoService.remover(+id);
    }

    @Delete('usuario/:usuarioId/local/:localId')
    removerPorLocalUsuario(
        @Param('usuarioId') usuarioId: string,
        @Param('localId') localId: string,
    ) {
        return this.favoritoService.removerPorLocalUsuario(+usuarioId, +localId);
    }
}