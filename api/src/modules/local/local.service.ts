import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarLocalDto } from './dto/criar-local.dto';
import { AtualizarLocalDto } from './dto/atualizar-local.dto';

@Injectable()
export class LocalService {
    constructor(private prisma: PrismaService) { }

    async criar(data: CriarLocalDto) {
        const { medias, redes, horarios, amenidades, ...localData } = data;

        const local = await this.prisma.local.create({
            data: {
                ...localData,
                // Criar mídias se fornecidas
                medias: medias ? {
                    createMany: {
                        data: medias
                    }
                } : undefined,
                // Criar redes sociais se fornecidas
                redes: redes ? {
                    create: redes
                } : undefined,
                // Criar horários se fornecidos
                horarios: horarios ? {
                    createMany: {
                        data: horarios
                    }
                } : undefined,
                // Conectar amenidades se fornecidas
                amenidades: amenidades ? {
                    create: amenidades.map(amenidadeId => ({
                        amenidade: {
                            connect: { id: amenidadeId }
                        }
                    }))
                } : undefined,
            },
            include: {
                medias: true,
                redes: true,
                horarios: true,
                amenidades: {
                    include: { amenidade: true }
                }
            }
        });

        return local;
    }

    async buscarPorId(id: number) {
        const local = await this.prisma.local.findUnique({
            where: { id },
            include: {
                dono: { select: { id: true, nome: true, email: true, telefone: true } },
                medias: true,
                avaliacoes: {
                    include: {
                        usuario: { select: { id: true, nome: true, foto: true } },
                    },
                },
                horarios: true,
                amenidades: { include: { amenidade: true } },
                redes: true,
            },
        });

        if (!local) {
            throw new NotFoundException('Local não encontrado');
        }

        return local;
    }

    async listar(filtros?: { cidade?: string; estado?: string }) {
        const where: any = {};

        if (filtros?.cidade) {
            where.endereco_cidade = { contains: filtros.cidade };
        }

        if (filtros?.estado) {
            where.endereco_estado = filtros.estado;
        }

        return this.prisma.local.findMany({
            where,
            include: {
                dono: { select: { id: true, nome: true } },
                medias: { take: 1 },
                avaliacoes: { select: { nota: true } },
            },
        });
    }

    async atualizar(id: number, data: AtualizarLocalDto) {
        await this.buscarPorId(id);
        
        const { amenidades, ...localData } = data;
        
        // Preparar dados para atualização
        const updateData: any = { ...localData };
        
        // Se amenidades foram fornecidas, substituir todas
        if (amenidades !== undefined) {
            updateData.amenidades = {
                deleteMany: {}, // Remover todas as existentes
                create: amenidades.map(amenidadeId => ({
                    amenidade: {
                        connect: { id: amenidadeId }
                    }
                }))
            };
        }
        
        return this.prisma.local.update({ 
            where: { id }, 
            data: updateData,
            include: {
                medias: true,
                redes: true,
                horarios: true,
                amenidades: {
                    include: { amenidade: true }
                }
            }
        });
    }

    async remover(id: number) {
        await this.buscarPorId(id);
        return this.prisma.local.delete({ where: { id } });
    }

    async buscarPorProximidade(lat: number, lng: number, raio: number = 5) {
        // Aproximação simples usando diferença de coordenadas
        // Para produção, considere usar PostGIS ou cálculo Haversine
        const margem = raio / 111; // 1 grau ≈ 111km

        return this.prisma.local.findMany({
            where: {
                AND: [
                    { latitude: { gte: lat - margem, lte: lat + margem } },
                    { longitude: { gte: lng - margem, lte: lng + margem } },
                ],
            },
            include: {
                dono: { select: { id: true, nome: true } },
                medias: { take: 1 },
                avaliacoes: { select: { nota: true } },
            },
        });
    }

    async buscarPorLocador(locadorId: number) {
        return this.prisma.local.findMany({
            where: { dono_id: locadorId },
            include: {
                medias: { take: 1 },
                avaliacoes: { select: { nota: true } },
            },
        });
    }

    // Métodos para gerenciar mídias
    async adicionarMedia(localId: number, data: { url: string; tipo: 'IMG' | 'VID'; ordem: number }) {
        await this.buscarPorId(localId);
        
        return this.prisma.media.create({
            data: {
                local_id: localId,
                ...data
            }
        });
    }

    async removerMedia(localId: number, mediaId: number) {
        await this.buscarPorId(localId);
        
        return this.prisma.media.delete({
            where: { id: mediaId }
        });
    }

    // Métodos para gerenciar redes sociais
    async atualizarRedes(localId: number, data: { instagram?: string; facebook?: string; whatsapp?: string }) {
        await this.buscarPorId(localId);
        
        // Verifica se já existe redes sociais cadastradas
        const redesExistentes = await this.prisma.redes.findFirst({
            where: { local_id: localId }
        });

        if (redesExistentes) {
            return this.prisma.redes.update({
                where: { id: redesExistentes.id },
                data
            });
        } else {
            return this.prisma.redes.create({
                data: {
                    local_id: localId,
                    ...data
                }
            });
        }
    }

    // Métodos para gerenciar horários
    async adicionarHorario(localId: number, data: { dia: number; hora_abertura: string; hora_fechamento: string; fechado: boolean }) {
        await this.buscarPorId(localId);
        
        return this.prisma.horario_abertura.create({
            data: {
                local_id: localId,
                ...data
            }
        });
    }

    async atualizarHorario(localId: number, horarioId: number, data: { dia?: number; hora_abertura?: string; hora_fechamento?: string; fechado?: boolean }) {
        await this.buscarPorId(localId);
        
        const horario = await this.prisma.horario_abertura.findFirst({
            where: { id: horarioId, local_id: localId }
        });

        if (!horario) {
            throw new NotFoundException('Horário não encontrado para este local');
        }
        
        return this.prisma.horario_abertura.update({
            where: { id: horarioId },
            data
        });
    }

    async listarHorarios(localId: number) {
        await this.buscarPorId(localId);
        
        return this.prisma.horario_abertura.findMany({
            where: { local_id: localId },
            orderBy: { dia: 'asc' }
        });
    }

    async removerHorario(localId: number, horarioId: number) {
        await this.buscarPorId(localId);
        
        return this.prisma.horario_abertura.delete({
            where: { id: horarioId }
        });
    }
}