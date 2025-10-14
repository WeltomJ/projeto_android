import api, { ApiError } from './api.config';

export interface Local {
    id: number;
    dono_id: number;
    nome: string;
    descricao?: string;
    endereco_logradouro: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cidade: string;
    endereco_estado: string;
    endereco_cep?: string;
    endereco_pais: string;
    latitude?: number;
    longitude?: number;
    telefone_contato?: string;
    email_contato?: string;
    site?: string;
    criado_em?: string;
    atualizado_em?: string;
}

export interface CreateLocalDto {
    dono_id: number;
    nome: string;
    descricao?: string;
    endereco_logradouro: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cidade: string;
    endereco_estado: string;
    endereco_cep?: string;
    latitude?: number;
    longitude?: number;
    telefone_contato?: string;
    email_contato?: string;
    site?: string;
}

export const LocalService = {
    async criar(dto: CreateLocalDto): Promise<Local> {
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

    async atualizar(id: number, dados: Partial<CreateLocalDto>): Promise<Local> {
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
};