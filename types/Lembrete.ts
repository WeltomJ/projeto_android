export interface Lembrete {
    id: number;
    usuario_id: number;
    local_id?: number;
    titulo: string;
    descricao?: string;
    lembrar_em: string;
    concluido: boolean;
    criado_em?: string;
}