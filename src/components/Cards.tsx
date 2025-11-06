import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { LocalService } from '../services/Local.Service';
import { FavoritoService } from '../services/Favorito.Service';
import { Local } from '../../types/Local';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import { URL_UPLOADS } from '@env';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Cards: React.FC = () => {
    const [cardIndex, setCardIndex] = useState(0);
    const [locais, setLocais] = useState<Local[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { theme } = useTheme();

    useEffect(() => {
        carregarLocais();
    }, []);

    const carregarLocais = async () => {
        try {
            setLoading(true);
            const dados = await LocalService.listar();

            const locaisEmbaralhados = dados.sort(() => Math.random() - 0.5);
            setLocais(locaisEmbaralhados);
            setCardIndex(0); // Resetar o índice quando recarregar
        } catch (e: any) {
            console.error('Erro ao carregar locais:', e);
            Alert.alert('Erro', 'Não foi possível carregar os locais');
            setLocais([]);
            setCardIndex(0);
        } finally {
            setLoading(false);
        }
    };


    const onSwiped = () => setCardIndex((i) => i + 1);

    const onSwipedLeft = () => {
    };

    const onSwipedRight = async (indexRight: number) => {
        const currentLocal = locais[indexRight];
        if (!currentLocal) return;
        if (!user?.id) return; // usuário não logado

        try {
            await FavoritoService.adicionar({
                usuario_id: user.id,
                local_id: currentLocal.id,
            });
        } catch (error: any) {
            const status = error?.status || error?.statusCode || error?.response?.status;
            const erro = error?.response?.error ? error?.response?.error : null;
            if (status !== 409 && erro == "Conflict") {
                Alert.alert('Erro ao favoritar', erro || 'Não foi possível adicionar aos favoritos.');
            }
        }
    };
    const abrirDetalhes = useCallback(() => {
        const currentLocal = locais[cardIndex];
        if (currentLocal) {
            navigation.navigate('LocalDetails', { localId: currentLocal.id });
        }
    }, [cardIndex, locais, navigation]);

    const calcularMediaAvaliacoes = (local: Local): number => {
        if (!local.avaliacoes || local.avaliacoes.length === 0) return 0;
        const soma = local.avaliacoes.reduce((acc, av) => acc + av.nota, 0);
        return parseFloat((soma / local.avaliacoes.length).toFixed(1));
    };

    const getImagemPrincipal = (local: Local) => {
        if (local.medias && local.medias.length > 0) {
            const primeiraImagem = local.medias.find(m => m.tipo === 'IMG');
            if (primeiraImagem) {
                return { uri: `${URL_UPLOADS}/${primeiraImagem.url}` };
            }
        }
        // Imagem placeholder - sem imagem
        return { uri: 'https://via.placeholder.com/400x600/cccccc/666666?text=Sem+Imagem' };
    };

    const renderCard = (local?: Local) => {
        if (!local) return <View />;
        const mediaAvaliacao = calcularMediaAvaliacoes(local);

        return (
            <View style={styles.card}>
                <TouchableOpacity activeOpacity={0.9} onPress={abrirDetalhes} style={styles.cardTouchable}>
                    <Image source={getImagemPrincipal(local)} style={styles.cardImage} resizeMode="cover" />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']} style={styles.gradientOverlay}>
                        <View style={styles.cardInfo}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {local.nome}
                                </Text>
                                {mediaAvaliacao > 0 && (
                                    <View style={styles.ratingBadge}>
                                        <Text style={styles.ratingText}>⭐ {mediaAvaliacao}</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.cardLocation} numberOfLines={1}>
                                📍 {local.endereco_cidade}, {local.endereco_estado}
                            </Text>

                            {local.descricao && (
                                <Text style={styles.cardDescription} numberOfLines={3}>
                                    {local.descricao}
                                </Text>
                            )}

                            <View style={styles.badgesContainer}>
                                {local.avaliacoes && local.avaliacoes.length > 0 && (
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoBadgeText}>💬 {local.avaliacoes.length} avaliações</Text>
                                    </View>
                                )}
                                {local.medias && local.medias.length > 1 && (
                                    <View style={styles.infoBadge}>
                                        <Text style={styles.infoBadgeText}>📸 {local.medias.length} fotos</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity style={styles.detailsButton} onPress={abrirDetalhes}>
                                <Text style={styles.detailsButtonText}>Ver Detalhes 👉</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>Carregando locais...</Text>
            </View>
        );
    }

    if (locais.length === 0 || cardIndex >= locais.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>🎉 Você viu todos os locais!</Text>
                <Text style={[styles.emptySubtitle, { color: theme.text }]}>Volte mais tarde para ver novos lugares</Text>
                <TouchableOpacity style={[styles.reloadButton, { backgroundColor: theme.primary }]} onPress={carregarLocais}>
                    <Text style={styles.reloadButtonText}>🔄 Recarregar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Swiper
                cards={locais}
                cardIndex={cardIndex}
                renderCard={renderCard}
                backgroundColor="transparent"
                stackSize={2}
                stackSeparation={12}
                animateCardOpacity
                disableBottomSwipe
                disableTopSwipe
                verticalSwipe={false}
                cardStyle={styles.card}
                onSwiped={onSwiped}
                onSwipedLeft={onSwipedLeft}
                onSwipedRight={onSwipedRight}
                onSwipedAll={() => setCardIndex(locais.length)}
                outputRotationRange={["-15deg", "0deg", "15deg"]}
                useViewOverflow={false}
                cardVerticalMargin={40}
                cardHorizontalMargin={20}
                marginTop={0}
                marginBottom={0}
                containerStyle={styles.swiperContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    swiperContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
    },
    card: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.7,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        backgroundColor: '#fff',
    },
    cardTouchable: {
        flex: 1,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '50%',
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    cardInfo: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        marginRight: 10,
    },
    cardLocation: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8,
        opacity: 0.9,
    },
    cardDescription: {
        fontSize: 15,
        color: '#fff',
        marginTop: 8,
        lineHeight: 22,
        opacity: 0.95,
    },
    ratingBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    ratingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    infoBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    infoBadgeText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    detailsButton: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 15,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    likeLabel: {
        position: 'absolute',
        top: 50,
        right: 40,
        transform: [{ rotate: '30deg' }],
        borderWidth: 5,
        borderColor: '#4CAF50',
        borderRadius: 10,
        padding: 10,
        zIndex: 1000,
    },
    likeLabelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    nopeLabel: {
        position: 'absolute',
        top: 50,
        left: 40,
        transform: [{ rotate: '-30deg' }],
        borderWidth: 5,
        borderColor: '#F44336',
        borderRadius: 10,
        padding: 10,
        zIndex: 1000,
    },
    nopeLabelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F44336',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: 24,
    },
    reloadButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
        elevation: 3,
    },
    reloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Cards;
