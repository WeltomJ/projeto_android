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
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme } from '../utils/ThemeContext';
import { useLocador } from '../utils/LocadorContext';
import { LocadorService } from '../services/Locador.Service';
import { GoogleAuthService } from '../services/GoogleAuth.Service';

export default function LocadorLoginScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { setLocador, setToken } = useLocador();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const response = await LocadorService.login(email, senha);
            
            // Salvar no contexto
            await setLocador(response.user);
            await setToken(response.accessToken);
            
            Alert.alert('Sucesso', 'Login realizado com sucesso!');
            navigation.navigate('LocadorHome');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            GoogleAuthService.configure();
            const response = await GoogleAuthService.signIn('locador');
            
            // Salvar no contexto
            await setLocador(response.user);
            await setToken(response.accessToken);
            
            Alert.alert('Sucesso', 'Login com Google realizado!');
            navigation.navigate('LocadorHome');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao fazer login com Google');
        } finally {
            setGoogleLoading(false);
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
                >
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Welcome')} 
                        style={styles.backButton}
                    >
                        <FontAwesome name="arrow-left" size={20} color={theme.white} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                            <FontAwesome name="building-o" size={40} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.white }]}>
                            Locador
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.white }]}>
                            Gerencie seus espaços
                        </Text>
                    </View>

                    <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.formTitle, { color: theme.text }]}>
                            Entre na sua conta
                        </Text>

                        <Input
                            placeholder="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            placeholder="Senha"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Button
                            title="Entrar"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading || googleLoading}
                        />

                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OU</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, { borderColor: theme.border }]}
                            onPress={handleGoogleLogin}
                            disabled={loading || googleLoading}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color={theme.primary} />
                            ) : (
                                <>
                                    <FontAwesome name="google" size={20} color="#DB4437" />
                                    <Text style={[styles.googleButtonText, { color: theme.text }]}>
                                        Continuar com Google
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Não tem uma conta?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('LocadorRegister')}>
                                <Text style={[styles.footerLink, { color: theme.primary }]}>
                                    Cadastre-se
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
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
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
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        gap: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
