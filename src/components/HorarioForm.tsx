import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme } from '../utils/ThemeContext';
import { LocalService } from '../services/Local.Service';

interface Horario {
    id?: number;
    dia: number;
    hora_abertura: string;
    hora_fechamento: string;
    fechado: boolean;
}

interface HorarioFormProps {
    localId: number;
    onSave?: () => void;
}

const diasSemana = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];

export default function HorarioForm({ localId, onSave }: HorarioFormProps) {
    const { theme } = useTheme();
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        carregarHorarios();
    }, [localId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregarHorarios();
        setRefreshing(false);
    }, [localId]);

    const carregarHorarios = async () => {
        try {
            setLoading(true);
            const dados = await LocalService.listarHorarios(localId);
            
            // Cria array com todos os dias da semana
            const horariosCompletos = diasSemana.map((_, dia) => {
                const horarioExistente = dados.find((h: Horario) => h.dia === dia);
                return horarioExistente || {
                    dia,
                    hora_abertura: '09:00',
                    hora_fechamento: '18:00',
                    fechado: false,
                };
            });
            
            setHorarios(horariosCompletos);
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            Alert.alert('Erro', 'Não foi possível carregar os horários');
        } finally {
            setLoading(false);
        }
    };

    const formatarHorario = (texto: string): string => {
        // Remove tudo que não é número
        const numeros = texto.replace(/\D/g, '');
        
        // Se não tem números, retorna vazio
        if (!numeros) return '';
        
        // Formata conforme a quantidade de dígitos  
        if (numeros.length <= 2) {
            return numeros;
        } else if (numeros.length <= 4) {
            return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
        } else {
            return `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
        }
    };

    const atualizarHorario = (dia: number, campo: keyof Horario, valor: any) => {
        // Se for campo de horário, aplica formatação
        if (campo === 'hora_abertura' || campo === 'hora_fechamento') {
            const valorFormatado = formatarHorario(valor);
            setHorarios((prev) =>
                prev.map((h) => (h.dia === dia ? { ...h, [campo]: valorFormatado } : h))
            );
        } else {
            setHorarios((prev) =>
                prev.map((h) => (h.dia === dia ? { ...h, [campo]: valor } : h))
            );
        }
    };

    const validarHorario = (hora: string): boolean => {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return regex.test(hora);
    };

    const salvarHorarios = async () => {
        try {
            // Validar horários
            for (const horario of horarios) {
                if (!horario.fechado) {
                    if (!validarHorario(horario.hora_abertura)) {
                        Alert.alert('Erro', `Horário de abertura inválido para ${diasSemana[horario.dia]}`);
                        return;
                    }
                    if (!validarHorario(horario.hora_fechamento)) {
                        Alert.alert('Erro', `Horário de fechamento inválido para ${diasSemana[horario.dia]}`);
                        return;
                    }
                }
            }

            setSaving(true);

            // Salvar cada horário
            for (const horario of horarios) {
                if (horario.id) {
                    // Atualizar existente
                    await LocalService.atualizarHorario(localId, horario.id, {
                        hora_abertura: horario.hora_abertura,
                        hora_fechamento: horario.hora_fechamento,
                        fechado: horario.fechado,
                    });
                } else {
                    // Criar novo
                    await LocalService.adicionarHorario(localId, {
                        dia: horario.dia,
                        hora_abertura: horario.hora_abertura,
                        hora_fechamento: horario.hora_fechamento,
                        fechado: horario.fechado,
                    });
                }
            }

            Alert.alert('Sucesso', 'Horários salvos com sucesso!');
            if (onSave) onSave();
        } catch (error) {
            console.error('Erro ao salvar horários:', error);
            Alert.alert('Erro', 'Não foi possível salvar os horários');
        } finally {
            setSaving(false);
        }
    };

    const copiarHorario = (diaOrigem: number) => {
        const horarioOrigem = horarios.find((h) => h.dia === diaOrigem);
        if (!horarioOrigem) return;

        Alert.alert(
            'Copiar Horário',
            `Copiar horário de ${diasSemana[diaOrigem]} para quais dias?`,
            [
                {
                    text: 'Dias úteis (Seg-Sex)',
                    onPress: () => {
                        setHorarios((prev) =>
                            prev.map((h) =>
                                h.dia >= 1 && h.dia <= 5
                                    ? {
                                          ...h,
                                          hora_abertura: horarioOrigem.hora_abertura,
                                          hora_fechamento: horarioOrigem.hora_fechamento,
                                          fechado: horarioOrigem.fechado,
                                      }
                                    : h
                            )
                        );
                    },
                },
                {
                    text: 'Fim de semana',
                    onPress: () => {
                        setHorarios((prev) =>
                            prev.map((h) =>
                                h.dia === 0 || h.dia === 6
                                    ? {
                                          ...h,
                                          hora_abertura: horarioOrigem.hora_abertura,
                                          hora_fechamento: horarioOrigem.hora_fechamento,
                                          fechado: horarioOrigem.fechado,
                                      }
                                    : h
                            )
                        );
                    },
                },
                {
                    text: 'Todos os dias',
                    onPress: () => {
                        setHorarios((prev) =>
                            prev.map((h) => ({
                                ...h,
                                hora_abertura: horarioOrigem.hora_abertura,
                                hora_fechamento: horarioOrigem.hora_fechamento,
                                fechado: horarioOrigem.fechado,
                            }))
                        );
                    },
                },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[theme.primary]}
                    tintColor={theme.primary}
                />
            }
        >
            <Text style={[styles.title, { color: theme.text }]}>
                Horários de Funcionamento
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
                Configure os horários de abertura e fechamento para cada dia da semana
            </Text>

            {horarios.map((horario) => (
                <View
                    key={horario.dia}
                    style={[styles.diaCard, { backgroundColor: theme.card }]}
                >
                    <View style={styles.diaHeader}>
                        <Text style={[styles.diaNome, { color: theme.text }]}>
                            {diasSemana[horario.dia]}
                        </Text>
                        <View style={styles.fechadoContainer}>
                            <Text style={[styles.fechadoLabel, { color: theme.subtext }]}>
                                Fechado
                            </Text>
                            <Switch
                                value={horario.fechado}
                                onValueChange={(valor) =>
                                    atualizarHorario(horario.dia, 'fechado', valor)
                                }
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor={horario.fechado ? theme.primaryDark : theme.subtext}
                            />
                        </View>
                    </View>

                    {!horario.fechado && (
                        <>
                            <View style={styles.horariosRow}>
                                <View style={styles.horarioInput}>
                                    <Text style={[styles.label, { color: theme.subtext }]}>
                                        Abertura
                                    </Text>
                                    <Input
                                        placeholder="HH:MM"
                                        value={horario.hora_abertura}
                                        onChangeText={(texto) =>
                                            atualizarHorario(horario.dia, 'hora_abertura', texto)
                                        }
                                        maxLength={5}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.horarioInput}>
                                    <Text style={[styles.label, { color: theme.subtext }]}>
                                        Fechamento
                                    </Text>
                                    <Input
                                        placeholder="HH:MM"
                                        value={horario.hora_fechamento}
                                        onChangeText={(texto) =>
                                            atualizarHorario(horario.dia, 'hora_fechamento', texto)
                                        }
                                        maxLength={5}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.copiarButton}
                                onPress={() => copiarHorario(horario.dia)}
                            >
                                <Text style={[styles.copiarText, { color: theme.primary }]}>
                                    📋 Copiar este horário
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ))}

            <Button
                title={saving ? 'Salvando...' : 'Salvar Horários'}
                onPress={salvarHorarios}
                disabled={saving}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    diaCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    diaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    diaNome: {
        fontSize: 18,
        fontWeight: '600',
    },
    fechadoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fechadoLabel: {
        fontSize: 14,
    },
    horariosRow: {
        flexDirection: 'row',
        gap: 12,
    },
    horarioInput: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    copiarButton: {
        marginTop: 8,
        padding: 8,
        alignItems: 'center',
    },
    copiarText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
