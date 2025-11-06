import api, { ApiError } from './api.config';
import * as FileSystem from 'expo-file-system';

export interface UploadResult {
    filename: string;
    url: string;
    mimetype: string;
    size: number;
}

export const UploadService = {
    /**
     * Faz upload de um único arquivo (imagem ou vídeo)
     */
    async uploadSingle(uri: string): Promise<UploadResult> {
        try {
            const formData = new FormData();

            // Extrair informações do arquivo
            const filename = uri.split('/').pop() || 'file';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            // Adicionar arquivo ao FormData
            formData.append('file', {
                uri,
                name: filename,
                type,
            } as any);

            const response = await api.post<UploadResult>('/upload/single', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao fazer upload do arquivo',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    /**
     * Faz upload de múltiplos arquivos
     */
    async uploadMultiple(uris: string[]): Promise<UploadResult[]> {
        try {
            const formData = new FormData();

            for (const uri of uris) {
                const filename = uri.split('/').pop() || 'file';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('files', {
                    uri,
                    name: filename,
                    type,
                } as any);
            }

            const response = await api.post<UploadResult[]>('/upload/multiple', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            throw new ApiError(
                error.response?.data?.message || 'Erro ao fazer upload dos arquivos',
                error.response?.status || 500,
                error.response?.data
            );
        }
    },

    /**
     * Converte uma imagem para base64
     */
    async toBase64(uri: string): Promise<string> {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
            throw new Error('Erro ao converter imagem para base64');
        }
    }
};
