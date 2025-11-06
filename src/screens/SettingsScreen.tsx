import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { GoogleAuthService } from '../services/GoogleAuth.Service';
import { FontAwesome } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            
                            // Fazer logout do Google se estiver logado
                            try {
                                await GoogleAuthService.signOut();
                            } catch (error) {
                                console.log('Não estava logado com Google');
                            }
                            
                            // Fazer logout da aplicação
                            await signOut();
                        } catch (error) {
                            Alert.alert(
                                'Erro',
                                'Não foi possível fazer logout. Tente novamente.'
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const goToProfileEdit = () => {
        navigation.navigate('ProfileEdit');
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        // Aguarda um momento para simular atualização
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar title="Configurações" />
            
            <ScrollView 
                contentContainerStyle={styles.content}
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
                        Aparência
                    </Text>
                    <ThemeToggle />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Conta
                    </Text>

                    <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>
                            Nome
                        </Text>
                        <Text style={[styles.value, { color: theme.text }]}>
                            {user?.nome || 'Não informado'}
                        </Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>
                            Email
                        </Text>
                        <Text style={[styles.value, { color: theme.text }]}>
                            {user?.email || 'Não informado'}
                        </Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>
                            Telefone
                        </Text>
                        <Text style={[styles.value, { color: theme.text }]}>
                            {user?.telefone || 'Não informado'}
                        </Text>
                    </View>

                    <TouchableOpacity 
                        style={[styles.editButton, { backgroundColor: theme.primary }]}
                        onPress={goToProfileEdit}
                    >
                        <Text style={[styles.editButtonText, { color: theme.white }]}>
                            Editar Perfil
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.logoutButton, { 
                            backgroundColor: theme.error,
                            opacity: isLoading ? 0.6 : 1 
                        }]}
                        onPress={handleLogout}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="sign-out" size={18} color={theme.white} />
                        <Text style={[styles.logoutButtonText, { color: theme.white }]}>
                            {isLoading ? 'Saindo...' : 'Sair da Conta'}
                        </Text>
                    </TouchableOpacity>

                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color={theme.primary}
                            style={styles.loader}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoCard: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    editButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    editButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButtonText: {
        fontWeight: '700',
        fontSize: 16,
    },
    loader: {
        marginTop: 16,
    },
});