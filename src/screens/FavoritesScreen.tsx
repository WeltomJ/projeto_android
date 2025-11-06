import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';
import { FavoritoService, Favorito } from '../services/Favorito.Service';
import { LocalService } from '../services/Local.Service';
import { Local } from '../../types/Local';
import { FontAwesome } from '@expo/vector-icons';

export default function FavoritesScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [favorites, setFavorites] = useState<(Favorito & { local?: Local })[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const favs = await FavoritoService.listarPorUsuario(user.id);
            
            // Carregar detalhes dos locais
            const favsWithLocals = await Promise.all(
                favs.map(async (fav) => {
                    try {
                        const local = await LocalService.obter(fav.local_id);
                        return { ...fav, local };
                    } catch {
                        return fav;
                    }
                })
            );

            setFavorites(favsWithLocals);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Recarrega favoritos sempre que a tela ganha foco
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    }, [loadFavorites]);

    const removeFavorite = async (id: number) => {
        try {
            await FavoritoService.remover(id);
            setFavorites(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Erro ao remover favorito:', error);
        }
    };

    const renderItem = ({ item }: { item: Favorito & { local?: Local } }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.navigate('LocalDetails', { localId: item.local_id })}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <FontAwesome name="heart" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                    {item.local?.nome || 'Local não encontrado'}
                </Text>
                {item.local?.endereco_cidade && (
                    <View style={styles.locationRow}>
                        <FontAwesome name="map-marker" size={14} color={theme.textSecondary} />
                        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                            {item.local.endereco_cidade}, {item.local.endereco_estado}
                        </Text>
                    </View>
                )}
                {item.local?.descricao && (
                    <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.local.descricao}
                    </Text>
                )}
            </View>
            <TouchableOpacity
                onPress={(e) => {
                    e.stopPropagation();
                    removeFavorite(item.id);
                }}
                style={[styles.deleteButton, { backgroundColor: theme.background }]}
            >
                <FontAwesome name="trash" size={18} color={theme.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Navbar title="Favoritos" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar title="Favoritos" />
            {favorites.length === 0 ? (
                <View style={styles.centerContent}>
                    <FontAwesome name="heart-o" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Nenhum favorito ainda
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                        Adicione locais aos favoritos para vê-los aqui
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme.primary]}
                            tintColor={theme.primary}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    listContent: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        minHeight: 80,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        flex: 1,
    },
    cardDescription: {
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    deleteButton: {
        padding: 10,
        borderRadius: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});