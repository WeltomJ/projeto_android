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
    Image, 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorModal from '../components/ErrorModal';
const AppLogo = require('../../assets/logo_2.png');

export default function LoginScreen() {
    const navigation = useNavigation();
    const { signIn, loading } = useAuth();
    const { theme } = useTheme();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !senha.trim()) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!email.includes('@')) {
            setError('Por favor, insira um email válido');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            await signIn({ email: email.trim(), senha });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
        } finally {
            setIsLoading(false);
        }
    };

    const goToRegister = () => {
        navigation.navigate('Register' as never);
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
                    <Image
                      source={AppLogo}
                      style={styles.logo}
                       resizeMode="contain"
                    />

                    
                    <Text style={[styles.title, { color: theme.text }]}>Bem-vindo</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Faça login para continuar
                    </Text>

                    <View style={styles.form}>
                        <Input
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading && !loading}
                        />

                        <Input
                            placeholder="Senha"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!isLoading && !loading}
                        />

                        <Button
                            title={isLoading || loading ? 'Entrando...' : 'Entrar'}
                            onPress={handleLogin}
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
                            Não tem uma conta?
                        </Text>
                        <TouchableOpacity onPress={goToRegister} disabled={isLoading || loading}>
                            <Text style={[styles.linkText, { color: theme.primary }]}>
                                Cadastre-se
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
   logo: {
  width: 600,
  height: 280,
  position: 'absolute',
  top: 90,           // distância do topo da tela
  alignSelf: 'center',
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