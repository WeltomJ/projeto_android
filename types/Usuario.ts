export interface Usuario {
	id: number;
	email: string;
	nome: string;
	senha?: string;
	criado_em?: string;
	atualizado_em?: string;
	[key: string]: any;
}