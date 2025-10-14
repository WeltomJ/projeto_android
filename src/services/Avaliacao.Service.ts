import api, { ApiError } from './api.config';

export interface Avaliacao {
    id: number;
    usuario_id: number;
    local_id: number;
    nota: number;
    comentario?: string;
    criado_em?: string;
    atualizado_em?: string;
}

export interface CreateAvaliacaoDto {
    usuario_id: number;
    local_id: number;
    nota: number;
    comentario?: string;
}

export const AvaliacaoService = {
    async criar(dto: CreateAvaliacaoDto): Promise<Avaliacao> {
        try {
            const response = await api.post<Avaliacao>('/avaliacao', dto);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao criar avaliação',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async obter(id: number): Promise<Avaliacao> {
        try {
            const response = await api.get<Avaliacao>(`/avaliacao/${id}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao obter avaliação',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listarPorLocal(localId: number): Promise<Avaliacao[]> {
        try {
            const response = await api.get<Avaliacao[]>(`/avaliacao/local/${localId}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar avaliações',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listarPorUsuario(usuarioId: number): Promise<Avaliacao[]> {
        try {
            const response = await api.get<Avaliacao[]>(`/avaliacao/usuario/${usuarioId}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar avaliações',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async obterMedia(localId: number): Promise<{ media: number; total: number }> {
        try {
            const response = await api.get<{ media: number; total: number }>(`/avaliacao/local/${localId}/media`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao obter média',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async atualizar(id: number, dados: Partial<CreateAvaliacaoDto>): Promise<Avaliacao> {
        try {
            const response = await api.put<Avaliacao>(`/avaliacao/${id}`, dados);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar avaliação',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async remover(id: number): Promise<void> {
        try {
            await api.delete(`/avaliacao/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover avaliação',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },
};