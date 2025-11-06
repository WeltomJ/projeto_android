import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme } from '../utils/ThemeContext';
import { LocadorService } from '../services/Locador.Service';

export default function LocadorRegisterScreen({ navigation }: any) {
    const { theme } = useTheme();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

    const formatarTelefone = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 2) {
            return `(${cleaned}`;
        } else if (cleaned.length <= 7) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        } else {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        }
    };

    const handleRegister = async () => {
        if (!nome || !email || !senha || !confirmarSenha) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (senha.length < 6) {
            Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Erro', 'E-mail inválido');
            return;
        }

        setLoading(true);
        try {
            await LocadorService.registrar({
                nome,
                email,
                senha,
                telefone: telefone || undefined,
            });

            Alert.alert(
                'Sucesso',
                'Cadastro realizado com sucesso! Faça login para continuar.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('LocadorLogin'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                            <FontAwesome name="building-o" size={40} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.white }]}>
                            Criar Conta
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.white }]}>
                            Cadastre-se como locador
                        </Text>
                    </View>

                    <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
                        <Input
                            placeholder="Nome completo *"
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                        />

                        <Input
                            placeholder="E-mail *"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            placeholder="Telefone"
                            value={telefone}
                            onChangeText={(text) => setTelefone(formatarTelefone(text))}
                            keyboardType="phone-pad"
                        />

                        <Input
                            placeholder="Senha *"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showSenha}
                            autoCapitalize="none"
                            rightIcon={showSenha ? 'eye-slash' : 'eye'}
                            onRightIconPress={() => setShowSenha(!showSenha)}
                        />

                        <Input
                            placeholder="Confirmar senha *"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            secureTextEntry={!showConfirmarSenha}
                            autoCapitalize="none"
                            rightIcon={showConfirmarSenha ? 'eye-slash' : 'eye'}
                            onRightIconPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
                        />

                        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                            * Campos obrigatórios
                        </Text>

                        <Button
                            title="Cadastrar"
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                        />

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Já tem uma conta?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('LocadorLogin')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>
                                    Faça login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.9,
    },
    formContainer: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        marginBottom: 20,
    },
    helperText: {
        fontSize: 12,
        marginBottom: 8,
        marginTop: -4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
