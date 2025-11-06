import api, { ApiError } from './api.config';
import { Local, CriarLocalDto } from '../../types/Local';
import { Media, RedesSociais, HorarioAbertura } from '../../types/LocalExtra';

export const LocalService = {
    async criar(dto: CriarLocalDto): Promise<Local> {
        try {
            const response = await api.post<Local>('/local', dto);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao criar local',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async obter(id: number): Promise<Local> {
        try {
            const response = await api.get<Local>(`/local/${id}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao obter local',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listar(filtros?: { cidade?: string; estado?: string }): Promise<Local[]> {
        try {
            const response = await api.get<Local[]>('/local', { params: filtros });
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar locais',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async atualizar(id: number, dados: Partial<CriarLocalDto>): Promise<Local> {
        try {
            const response = await api.put<Local>(`/local/${id}`, dados);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar local',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async remover(id: number): Promise<void> {
        try {
            await api.delete(`/local/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover local',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async buscarPorProximidade(latitude: number, longitude: number, raio: number = 5): Promise<Local[]> {
        try {
            const response = await api.get<Local[]>('/local/proximidade', {
                params: { lat: latitude, lng: longitude, raio },
            });
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao buscar locais próximos',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async buscarPorLocador(locadorId: number): Promise<Local[]> {
        try {
            const response = await api.get<Local[]>(`/local/locador/${locadorId}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao buscar locais do locador',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    // Métodos para gerenciar mídias
    async adicionarMedia(localId: number, data: { url: string; tipo: 'IMG' | 'VID'; ordem: number }): Promise<Media> {
        try {
            const response = await api.post<Media>(`/local/${localId}/media`, data);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao adicionar mídia',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async removerMedia(localId: number, mediaId: number): Promise<void> {
        try {
            await api.delete(`/local/${localId}/media/${mediaId}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover mídia',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    // Métodos para gerenciar redes sociais
    async atualizarRedes(localId: number, data: { instagram?: string; facebook?: string; whatsapp?: string }): Promise<RedesSociais> {
        try {
            const response = await api.put<RedesSociais>(`/local/${localId}/redes`, data);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar redes sociais',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    // Métodos para gerenciar horários
    async listarHorarios(localId: number): Promise<HorarioAbertura[]> {
        try {
            const response = await api.get<HorarioAbertura[]>(`/local/${localId}/horario`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar horários',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async adicionarHorario(localId: number, data: { dia: number; hora_abertura: string; hora_fechamento: string; fechado: boolean }): Promise<HorarioAbertura> {
        try {
            const response = await api.post<HorarioAbertura>(`/local/${localId}/horario`, data);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao adicionar horário',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async atualizarHorario(localId: number, horarioId: number, data: { hora_abertura?: string; hora_fechamento?: string; fechado?: boolean }): Promise<HorarioAbertura> {
        try {
            const response = await api.put<HorarioAbertura>(`/local/${localId}/horario/${horarioId}`, data);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar horário',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async removerHorario(localId: number, horarioId: number): Promise<void> {
        try {
            await api.delete(`/local/${localId}/horario/${horarioId}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover horário',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },
};