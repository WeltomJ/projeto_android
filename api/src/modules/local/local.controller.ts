import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { LocalService } from './local.service';

@Controller('local')
export class LocalController {
    constructor(private localService: LocalService) { }

    @Post()
    criar(@Body() data: any) {
        return this.localService.criar(data);
    }

    @Get(':id')
    buscarPorId(@Param('id') id: string) {
        return this.localService.buscarPorId(+id);
    }

    @Get()
    listar(@Query('cidade') cidade?: string, @Query('estado') estado?: string) {
        return this.localService.listar({ cidade, estado });
    }

    @Put(':id')
    atualizar(@Param('id') id: string, @Body() data: any) {
        return this.localService.atualizar(+id, data);
    }

    @Delete(':id')
    remover(@Param('id') id: string) {
        return this.localService.remover(+id);
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
}