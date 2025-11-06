export interface Media {
    id: number;
    local_id: number;
    url: string;
    tipo: 'IMG' | 'VID';
    ordem: number;
    criado_em?: string;
}

export interface RedesSociais {
    id: number;
    local_id: number;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
}

export interface HorarioAbertura {
    id: number;
    local_id: number;
    dia: number; // 0 = domingo, 1 = segunda, ... 6 = sábado
    hora_abertura: string; // "HH:mm"
    hora_fechamento: string; // "HH:mm"
    fechado: boolean;
}

export interface Amenidade {
    id: number;
    nome: string;
}
