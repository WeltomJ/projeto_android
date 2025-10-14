import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorModal from '../components/ErrorModal';

export default function RegisterScreen() {
    const navigation = useNavigation();
    const { signUp, loading } = useAuth();
    const { theme } = useTheme();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        if (!nome.trim() || !email.trim() || !senha.trim()) {
            setError('Por favor, preencha todos os campos obrigatórios');
            return false;
        }

        if (!email.includes('@')) {
            setError('Por favor, insira um email válido');
            return false;
        }

        if (senha.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return false;
        }

        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await signUp({
                nome: nome.trim(),
                email: email.trim(),
                senha,
                telefone: telefone.trim() || undefined,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar conta');
        } finally {
            setIsLoading(false);
        }
    };

    const goToLogin = () => {
        navigation.navigate('Login' as never);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }]}>Criar Conta</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Preencha os dados para se cadastrar
                    </Text>

                    <View style={styles.form}>
                        <Input
                            placeholder="Nome completo *"
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                            editable={!isLoading && !loading}
                        />

                        <Input
                            placeholder="Email *"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading && !loading}
                        />

                        <Input
                            placeholder="Telefone"
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                            editable={!isLoading && !loading}
                        />

                        <Input
                            placeholder="Senha *"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!isLoading && !loading}
                        />

                        <Input
                            placeholder="Confirmar senha *"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!isLoading && !loading}
                        />

                        <Button
                            title={isLoading || loading ? 'Cadastrando...' : 'Cadastrar'}
                            onPress={handleRegister}
                            disabled={isLoading || loading}
                        />

                        {(isLoading || loading) && (
                            <ActivityIndicator
                                size="small"
                                color={theme.primary}
                                style={styles.loader}
                            />
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                            Já tem uma conta?
                        </Text>
                        <TouchableOpacity onPress={goToLogin} disabled={isLoading || loading}>
                            <Text style={[styles.linkText, { color: theme.primary }]}>
                                Faça login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <ErrorModal
                visible={!!error}
                message={error || ''}
                onClose={() => setError(null)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
    },
    form: {
        marginBottom: 24,
    },
    loader: {
        marginTop: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});