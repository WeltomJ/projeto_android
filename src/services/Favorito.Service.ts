import api, { ApiError } from './api.config';

export interface Favorito {
    id: number;
    usuario_id: number;
    local_id: number;
    criado_em?: string;
}

export interface CreateFavoritoDto {
    usuario_id: number;
    local_id: number;
}

export const FavoritoService = {
    async adicionar(dto: CreateFavoritoDto): Promise<Favorito> {
        try {
            const response = await api.post<Favorito>('/favorito', dto);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao adicionar favorito',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listarPorUsuario(usuarioId: number): Promise<Favorito[]> {
        try {
            const response = await api.get<Favorito[]>(`/favorito/usuario/${usuarioId}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar favoritos',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async verificar(usuarioId: number, localId: number): Promise<{ isFavorito: boolean; favorito?: Favorito }> {
        try {
            const response = await api.get<{ isFavorito: boolean; favorito?: Favorito }>(
                `/favorito/verificar/${usuarioId}/${localId}`
            );
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao verificar favorito',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async remover(id: number): Promise<void> {
        try {
            await api.delete(`/favorito/${id}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover favorito',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async removerPorLocalUsuario(usuarioId: number, localId: number): Promise<void> {
        try {
            await api.delete(`/favorito/usuario/${usuarioId}/local/${localId}`);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover favorito',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },
}