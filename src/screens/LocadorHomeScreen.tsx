import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../utils/ThemeContext';
import { useLocador } from '../utils/LocadorContext';
import { LocadorService } from '../services/Locador.Service';
import { LocalService } from '../services/Local.Service';
import { Local } from '../../types/Local';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';
import { URL_UPLOADS } from '@env';

export default function LocadorHomeScreen({ navigation }: any) {
    const { theme } = useTheme();
    const { locador, setLocador, logout } = useLocador();
    const [locais, setLocais] = useState<Local[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const carregarDados = useCallback(async () => {
        try {
            if (locador) {
                const locaisData = await LocalService.buscarPorLocador(locador.id);
                setLocais(locaisData);
            }
        } catch (error: any) {
            Alert.alert('Erro', 'Erro ao carregar dados');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [locador]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const onRefresh = () => {
        setRefreshing(true);
        carregarDados();
    };

    const handleSelecionarFoto = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && locador) {
            try {
                const updated = await LocadorService.atualizarFoto(locador.id, result.assets[0].uri);
                await setLocador(updated);
                Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
            } catch (error: any) {
                Alert.alert('Erro', error.message || 'Erro ao atualizar foto');
            }
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Deseja realmente sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        // AppNavigator vai redirecionar automaticamente após logout
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
            }
        >
            {/* Header com foto de perfil */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <View style={styles.themeToggleContainer}>
                    <ThemeToggle />
                </View>
                <TouchableOpacity onPress={handleSelecionarFoto} style={styles.fotoContainer}>
                    {locador?.foto ? (
                        <Image source={{ uri: locador.foto }} style={styles.foto} />
                    ) : (
                        <View style={[styles.fotoPlaceholder, { backgroundColor: theme.surface }]}>
                            <FontAwesome name="user" size={40} color={theme.primary} />
                        </View>
                    )}
                    <View style={[styles.fotoBadge, { backgroundColor: theme.surface }]}>
                        <FontAwesome name="camera" size={14} color={theme.primary} />
                    </View>
                </TouchableOpacity>

                <Text style={[styles.nome, { color: theme.white }]}>{locador?.nome}</Text>
                <Text style={[styles.email, { color: theme.white }]}>{locador?.email}</Text>
                {locador?.telefone && (
                    <Text style={[styles.telefone, { color: theme.white }]}>{locador.telefone}</Text>
                )}

                <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.surface }]}
                    onPress={() => navigation.navigate('LocadorEditProfile', { locador })}
                >
                    <FontAwesome name="edit" size={16} color={theme.primary} />
                    <Text style={[styles.editButtonText, { color: theme.primary }]}>Editar perfil</Text>
                </TouchableOpacity>
            </View>

            {/* Seção de locais */}
            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Meus Locais</Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('LocadorAddLocal', { locadorId: locador?.id })}
                    >
                        <FontAwesome name="plus" size={16} color={theme.white} />
                        <Text style={[styles.addButtonText, { color: theme.white }]}>Adicionar</Text>
                    </TouchableOpacity>
                </View>

                {locais.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="map-marker" size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Você ainda não cadastrou nenhum local
                        </Text>
                        <Button
                            title="Cadastrar primeiro local"
                            onPress={() => navigation.navigate('LocadorAddLocal', { locadorId: locador?.id })}
                        />
                    </View>
                ) : (
                    locais.map((local) => (
                        <TouchableOpacity
                            key={local.id}
                            style={[styles.localCard, { backgroundColor: theme.surface }]}
                            onPress={() => navigation.navigate('LocadorEditLocal', { localId: local.id })}
                        >
                            {local.medias && local.medias.length > 0 ? (
                                <Image source={{ uri: URL_UPLOADS + local.medias[0].url }} style={styles.localImage} />
                            ) : (
                                <View style={[styles.localImagePlaceholder, { backgroundColor: theme.border }]}>
                                    <FontAwesome name="image" size={32} color={theme.textSecondary} />
                                </View>
                            )}

                            <View style={styles.localInfo}>
                                <Text style={[styles.localNome, { color: theme.text }]} numberOfLines={1}>
                                    {local.nome}
                                </Text>
                                <Text style={[styles.localEndereco, { color: theme.textSecondary }]} numberOfLines={1}>
                                    {local.endereco_logradouro}, {local.endereco_cidade} - {local.endereco_estado}
                                </Text>
                                {local.avaliacoes && local.avaliacoes.length > 0 && (
                                    <View style={styles.ratingContainer}>
                                        <FontAwesome name="star" size={14} color="#FFD700" />
                                        <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                                            {(local.avaliacoes.reduce((acc, a: any) => acc + a.nota, 0) / local.avaliacoes.length).toFixed(1)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <FontAwesome name="chevron-right" size={16} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {/* Botão de sair */}
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.error }]}
                onPress={handleLogout}
            >
                <FontAwesome name="sign-out" size={18} color={theme.error} />
                <Text style={[styles.logoutButtonText, { color: theme.error }]}>Sair da conta</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
        position: 'relative',
    },
    themeToggleContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    fotoContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    foto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    fotoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    fotoBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    nome: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        opacity: 0.9,
        marginBottom: 2,
    },
    telefone: {
        fontSize: 14,
        opacity: 0.9,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 16,
        gap: 8,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    localCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    localImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    localImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    localInfo: {
        flex: 1,
        marginLeft: 12,
    },
    localNome: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    localEndereco: {
        fontSize: 13,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 12,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
