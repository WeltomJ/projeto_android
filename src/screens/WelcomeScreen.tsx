import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

const AppLogo = require('../../assets/logo_2.png');

export default function WelcomeScreen({ navigation }: any) {
    const { theme } = useTheme();

    return (
        <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.gradient}
        >
            <View style={styles.container}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={AppLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.appName, { color: theme.white }]}>
                        Onde é, Manaus?
                    </Text>
                    <Text style={[styles.tagline, { color: theme.white }]}>
                        Descubra e compartilhe os melhores lugares
                    </Text>
                </View>

                {/* Botões de seleção */}
                <View style={styles.buttonsContainer}>
                    <Text style={[styles.title, { color: theme.white }]}>
                        Como você deseja continuar?
                    </Text>

                    {/* Botão Usuário */}
                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.white }]}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                            <FontAwesome name="user" size={28} color={theme.white} />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>
                                Sou Usuário
                            </Text>
                            <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                                Descubra locais, salve favoritos e avalie
                            </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={18} color={theme.primary} />
                    </TouchableOpacity>

                    {/* Botão Locador */}
                    <TouchableOpacity
                        style={[styles.optionButton, { backgroundColor: theme.white }]}
                        onPress={() => navigation.navigate('LocadorLogin')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: theme.secondary }]}>
                            <FontAwesome name="building-o" size={28} color={theme.white} />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>
                                Sou Locador
                            </Text>
                            <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                                Cadastre e gerencie seus estabelecimentos
                            </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={18} color={theme.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.white }]}>
                        Ao continuar, você concorda com nossos
                    </Text>
                    <TouchableOpacity>
                        <Text style={[styles.footerLink, { color: theme.white }]}>
                            Termos de Uso e Política de Privacidade
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    logo: {
        width: 200,
        height: 200,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.9,
    },
    buttonsContainer: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContent: {
        flex: 1,
        marginLeft: 16,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
    },
    footer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    footerText: {
        fontSize: 12,
        opacity: 0.8,
        textAlign: 'center',
    },
    footerLink: {
        fontSize: 12,
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginTop: 4,
    },
});
