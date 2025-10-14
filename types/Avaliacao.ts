export interface Avaliacao {
    id: number;
    usuario_id: number;
    local_id: number;
    nota: number;
    comentario?: string;
    criado_em?: string;
    atualizado_em?: string;
}