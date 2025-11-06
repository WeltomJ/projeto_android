interface CepResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

interface CoordinatesResponse {
    lat: number;
    lng: number;
}

export class CepService {
    private static readonly VIA_CEP_URL = 'https://viacep.com.br/ws';
    private static readonly GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

    static async buscarPorCep(cep: string): Promise<CepResponse | null> {
        try {
            const cepLimpo = cep.replace(/\D/g, '');
            
            if (cepLimpo.length !== 8) {
                throw new Error('CEP deve ter 8 dígitos');
            }

            const response = await fetch(`${this.VIA_CEP_URL}/${cepLimpo}/json/`);
            const data = await response.json();

            if (data.erro) {
                return null;
            }

            return data;
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            return null;
        }
    }

    static async obterCoordenadas(endereco: string): Promise<CoordinatesResponse | null> {
        try {
            const enderecoEncoded = encodeURIComponent(endereco);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${enderecoEncoded}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'LocalApp/1.0 (contact@example.com)',
                    },
                }
            );

            // Verificar se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Resposta não é JSON:', contentType);
                return null;
            }

            if (!response.ok) {
                console.error('Erro na resposta:', response.status);
                return null;
            }

            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                };
            }

            return null;
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error);
            return null;
        }
    }

    static formatarEndereco(
        logradouro: string,
        numero?: string,
        bairro?: string,
        cidade?: string,
        estado?: string
    ): string {
        const partes = [
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            'Brasil'
        ].filter(Boolean);

        return partes.join(', ');
    }
}