import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme } from '../utils/ThemeContext';
import { useLocador } from '../utils/LocadorContext';
import { LocadorService } from '../services/Locador.Service';

export default function LocadorEditProfileScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { locador: locadorContext, setLocador } = useLocador();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSenhaAtual, setShowSenhaAtual] = useState(false);
    const [showNovaSenha, setShowNovaSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (locadorContext) {
            setNome(locadorContext.nome || '');
            setEmail(locadorContext.email || '');
            setTelefone(locadorContext.telefone || '');
        }
    }, [locadorContext]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // Resetar campos com dados atuais
        if (locadorContext) {
            setNome(locadorContext.nome || '');
            setEmail(locadorContext.email || '');
            setTelefone(locadorContext.telefone || '');
        }
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    }, [locadorContext]);

    if (!locadorContext) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const formatarTelefone = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 2) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleSalvar = async () => {
        if (!nome || !email) {
            Alert.alert('Erro', 'Nome e e-mail são obrigatórios');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erro', 'E-mail inválido');
            return;
        }

        // Validar telefone se fornecido
        if (telefone.trim()) {
            const cleaned = telefone.replace(/\D/g, '');
            if (cleaned.length < 10) {
                Alert.alert('Erro', 'Telefone inválido. Use o formato (XX) XXXXX-XXXX');
                return;
            }
        }

        // Se está tentando alterar senha
        if (novaSenha || confirmarSenha || senhaAtual) {
            if (!senhaAtual) {
                Alert.alert('Erro', 'Informe sua senha atual para alterá-la');
                return;
            }

            if (novaSenha !== confirmarSenha) {
                Alert.alert('Erro', 'As senhas não coincidem');
                return;
            }

            if (novaSenha.length < 6) {
                Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres');
                return;
            }
        }

        setLoading(true);
        try {
            const dados: any = {
                nome,
                email,
                telefone: telefone || undefined,
            };

            if (novaSenha && senhaAtual) {
                dados.senha = novaSenha;
            }

            const locadorAtualizado = await LocadorService.atualizar(locadorContext.id, dados);
            
            await setLocador(locadorAtualizado);

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirConta = () => {
        Alert.alert(
            'Excluir Conta',
            'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus locais serão removidos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await LocadorService.remover(locadorContext.id);
                            await setLocador(null);
                            Alert.alert('Conta excluída', 'Sua conta foi excluída com sucesso');
                            navigation.navigate('LocadorLogin');
                        } catch (error: any) {
                            Alert.alert('Erro', error.message || 'Erro ao excluir conta');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.white} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.white }]}>Editar Perfil</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme.primary]}
                            tintColor={theme.primary}
                        />
                    }
                >
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Informações Básicas
                        </Text>

                        <Input
                            placeholder="Nome completo"
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                        />

                        <Input
                            placeholder="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            placeholder="Telefone (opcional)"
                            value={telefone}
                            onChangeText={(text) => setTelefone(formatarTelefone(text))}
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Alterar Senha
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                            Deixe em branco se não quiser alterar
                        </Text>

                        <Input
                            placeholder="Senha atual"
                            value={senhaAtual}
                            onChangeText={setSenhaAtual}
                            secureTextEntry={!showSenhaAtual}
                            autoCapitalize="none"
                            rightIcon={showSenhaAtual ? 'eye-slash' : 'eye'}
                            onRightIconPress={() => setShowSenhaAtual(!showSenhaAtual)}
                        />

                        <Input
                            placeholder="Nova senha"
                            value={novaSenha}
                            onChangeText={setNovaSenha}
                            secureTextEntry={!showNovaSenha}
                            autoCapitalize="none"
                            rightIcon={showNovaSenha ? 'eye-slash' : 'eye'}
                            onRightIconPress={() => setShowNovaSenha(!showNovaSenha)}
                        />

                        <Input
                            placeholder="Confirmar nova senha"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            secureTextEntry={!showConfirmarSenha}
                            autoCapitalize="none"
                            rightIcon={showConfirmarSenha ? 'eye-slash' : 'eye'}
                            onRightIconPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
                        />
                    </View>

                    <Button
                        title="Salvar Alterações"
                        onPress={handleSalvar}
                        loading={loading}
                        disabled={loading}
                    />

                    <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: theme.error }]}
                        onPress={handleExcluirConta}
                        disabled={loading}
                    >
                        <FontAwesome name="trash" size={16} color={theme.error} />
                        <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                            Excluir Conta
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 16,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginTop: 16,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
