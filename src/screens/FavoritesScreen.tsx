import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../utils/AuthContext';
import Navbar from '../components/Navbar';
import { FavoritoService, Favorito } from '../services/Favorito.Service';
import { LocalService, Local } from '../services/Local.Service';
import { FontAwesome } from '@expo/vector-icons';

export default function FavoritesScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<(Favorito & { local?: Local })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
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
    };

    const removeFavorite = async (id: number) => {
        try {
            await FavoritoService.remover(id);
            setFavorites(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Erro ao remover favorito:', error);
        }
    };

    const renderItem = ({ item }: { item: Favorito & { local?: Local } }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {item.local?.nome || 'Local não encontrado'}
                </Text>
                {item.local?.endereco_cidade && (
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                        {item.local.endereco_cidade}, {item.local.endereco_estado}
                    </Text>
                )}
            </View>
            <TouchableOpacity
                onPress={() => removeFavorite(item.id)}
                style={styles.deleteButton}
            >
                <FontAwesome name="trash" size={20} color={theme.error} />
            </TouchableOpacity>
        </View>
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
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
    },
    deleteButton: {
        padding: 8,
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