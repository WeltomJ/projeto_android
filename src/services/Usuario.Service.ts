import api, { ApiError } from './api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Usuario {
    id: number;
    email: string;
    nome: string;
    telefone?: string;
    foto?: string;
    criado_em?: string;
    atualizado_em?: string;
}

export interface CreateUsuarioDto {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
}

export interface LoginResponse {
    user: Usuario;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export const UsuarioService = {
    async registrar(dto: CreateUsuarioDto): Promise<Usuario> {
        try {
            const response = await api.post<Usuario>('/usuario/register', dto);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao registrar usuário',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async login(email: string, senha: string): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>('/auth/login', {
                email,
                senha,
                tipo: 'usuario',
            });

            const { accessToken, refreshToken, user } = response.data;

            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao fazer login',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async obterPerfil(id: number): Promise<Usuario> {
        try {
            const response = await api.get<Usuario>(`/usuario/${id}`);
            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao obter perfil',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async atualizar(id: number, dados: Partial<CreateUsuarioDto>): Promise<Usuario> {
        try {
            const response = await api.put<Usuario>(`/usuario/${id}`, dados);

            const user = await AsyncStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                if (userData.id === id) {
                    await AsyncStorage.setItem('user', JSON.stringify(response.data));
                }
            }

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao atualizar usuário',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async remover(id: number): Promise<void> {
        try {
            await api.delete(`/usuario/${id}`);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao remover usuário',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    async logout(): Promise<void> {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    },

    async obterUsuarioLogado(): Promise<Usuario | null> {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

export { ApiError };