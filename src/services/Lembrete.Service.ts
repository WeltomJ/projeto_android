import api, { ApiError } from './api.config';

export interface Lembrete {
    id: number;
    usuario_id: number;
    local_id?: number;
    titulo: string;
    descricao?: string;
    lembrar_em: string;
    concluido: boolean;
    criado_em?: string;
}

export interface CreateLembreteDto {
    usuario_id: number;
    local_id?: number;
    titulo: string;
    descricao?: string;
    lembrar_em: string;
}

export const LembreteService = {
    async criar(dto: CreateLembreteDto): Promise<Lembrete> {
        try {
            const response = await api.post<Lembrete>('/lembrete', dto);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao criar lembrete',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async obter(id: number): Promise<Lembrete> {
        try {
            const response = await api.get<Lembrete>(`/lembrete/${id}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao obter lembrete',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listarPorUsuario(usuarioId: number, concluido?: boolean): Promise<Lembrete[]> {
        try {
            const params: any = {};
            if (concluido !== undefined) {
                params.concluido = concluido.toString();
            }

            const response = await api.get<Lembrete[]>(`/lembrete/usuario/${usuarioId}`, { params });
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar lembretes',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listarPendentes(usuarioId: number): Promise<Lembrete[]> {
        try {
            const response = await api.get<Lembrete[]>(`/lembrete/usuario/${usuarioId}/pendentes`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar lembretes pendentes',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async atualizar(id: number, dados: Partial<CreateLembreteDto & { concluido?: boolean }>): Promise<Lembrete> {
        try {
            const response = await api.put<Lembrete>(`/lembrete/${id}`, dados);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar lembrete',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async marcarConcluido(id: number): Promise<Lembrete> {
        try {
            const response = await api.patch<Lembrete>(`/lembrete/${id}/concluir`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao marcar lembrete como concluído',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async remover(id: number): Promise<void> {
        try {
            await api.delete(`/lembrete/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover lembrete',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },
};