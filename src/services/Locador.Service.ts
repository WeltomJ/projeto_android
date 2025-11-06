import api, { ApiError } from './api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Locador {
    id: number;
    email: string;
    nome: string;
    telefone?: string;
    foto?: string;
    criado_em?: string;
    atualizado_em?: string;
}

export interface CreateLocadorDto {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
}

export interface LoginLocadorResponse {
    user: Locador;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const LocadorService = {
    async registrar(dto: CreateLocadorDto): Promise<Locador> {
        try {
            const response = await api.post<Locador>('/locador', dto);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao registrar locador',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async login(email: string, senha: string): Promise<LoginLocadorResponse> {
        try {
            const response = await api.post<LoginLocadorResponse>('/auth/login', {
                email,
                senha,
                tipo: 'locador',
            });

            const { accessToken, refreshToken, user } = response.data;

            // Salvar com prefixo 'locador' para não conflitar com o usuário comum
            await AsyncStorage.setItem('locadorToken', accessToken);
            await AsyncStorage.setItem('locadorRefreshToken', refreshToken);
            await AsyncStorage.setItem('locador', JSON.stringify(user));

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao fazer login',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async obter(id: number): Promise<Locador> {
        try {
            const response = await api.get<Locador>(`/locador/${id}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao obter locador',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async atualizar(id: number, dados: Partial<CreateLocadorDto>): Promise<Locador> {
        try {
            const response = await api.put<Locador>(`/locador/${id}`, dados);

            const locador = await AsyncStorage.getItem('locador');
            if (locador) {
                const locadorData = JSON.parse(locador);
                if (locadorData.id === id) {
                    await AsyncStorage.setItem('locador', JSON.stringify(response.data));
                }
            }

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar locador',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async remover(id: number): Promise<void> {
        try {
            await api.delete(`/locador/${id}`);
            await AsyncStorage.multiRemove(['locadorToken', 'locadorRefreshToken', 'locador']);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover locador',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async logout(): Promise<void> {
        await AsyncStorage.multiRemove(['locadorToken', 'locadorRefreshToken', 'locador']);
    },

    async obterLocadorLogado(): Promise<Locador | null> {
        const locador = await AsyncStorage.getItem('locador');
        return locador ? JSON.parse(locador) : null;
    },

    async atualizarFoto(id: number, fotoUri: string): Promise<Locador> {
        try {
            const formData = new FormData();
            
            const filename = fotoUri.split('/').pop() || 'foto';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('foto', {
                uri: fotoUri,
                name: filename,
                type,
            } as any);

            const response = await api.post<Locador>(`/locador/${id}/foto`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Atualizar AsyncStorage
            const locador = await AsyncStorage.getItem('locador');
            if (locador) {
                const locadorData = JSON.parse(locador);
                if (locadorData.id === id) {
                    await AsyncStorage.setItem('locador', JSON.stringify(response.data));
                }
            }

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar foto',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async listar(): Promise<Locador[]> {
        try {
            const response = await api.get<Locador[]>('/locador');
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao listar locadores',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },
};