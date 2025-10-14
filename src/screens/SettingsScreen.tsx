import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar title="Configurações" />
            
            <ScrollView contentContainerStyle={styles.content}>
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
                        <Text style={styles.editButtonText}>Editar Perfil</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Button
                        title={isLoading ? 'Saindo...' : 'Sair da Conta'}
                        onPress={handleLogout}
                        disabled={isLoading}
                    />

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
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    loader: {
        marginTop: 16,
    },
});