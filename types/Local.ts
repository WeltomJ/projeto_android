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