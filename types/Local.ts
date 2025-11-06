import { Media, RedesSociais, HorarioAbertura, Amenidade } from './LocalExtra';
import { Avaliacao } from './Avaliacao';

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
    
    // Relacionamentos
    medias?: Media[];
    redes?: RedesSociais[];
    horarios?: HorarioAbertura[];
    amenidades?: { amenidade: Amenidade }[];
    avaliacoes?: Avaliacao[];
}

export interface CriarLocalDto {
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
    endereco_pais?: string;
    latitude?: number;
    longitude?: number;
    telefone_contato?: string;
    email_contato?: string;
    site?: string;
    
    // Dados relacionados
    medias?: { url: string; tipo: 'IMG' | 'VID'; ordem: number }[];
    redes?: { instagram?: string; facebook?: string; whatsapp?: string };
    horarios?: {
        dia: number;
        hora_abertura: string;
        hora_fechamento: string;
        fechado: boolean;
    }[];
    amenidades?: number[]; // IDs das amenidades
}