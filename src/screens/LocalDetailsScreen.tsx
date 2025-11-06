import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Dimensions,
    Alert,
    RefreshControl,
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../utils/AuthContext';
import { LocalService } from '../services/Local.Service';
import { FavoritoService } from '../services/Favorito.Service';
import { AvaliacaoService } from '../services/Avaliacao.Service';
import { Local } from '../../types/Local';
import { Avaliacao } from '../../types/Avaliacao';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Input from '../components/Input';
import { URL_UPLOADS } from '@env';

const { width } = Dimensions.get('window');

interface Props {
    route: any;
    navigation: any;
}

const LocalDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { localId } = route.params;
    const { theme } = useTheme();
    const { user } = useAuth();

    const [local, setLocal] = useState<Local | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorito, setIsFavorito] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados para avaliação
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
    const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
    const [notaAvaliacao, setNotaAvaliacao] = useState(5);
    const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
    const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
    const [avaliacaoUsuario, setAvaliacaoUsuario] = useState<Avaliacao | null>(null);

    useEffect(() => {
        carregarLocal();
        verificarFavorito();
        carregarAvaliacoes();
    }, [localId]);

    const carregarLocal = async () => {
        try {
            setLoading(true);
            const data = await LocalService.obter(localId);
            setLocal(data);
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do local');
            console.error(error);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const verificarFavorito = async () => {
        if (!user) return;
        try {
            const resultado = await FavoritoService.verificar(user.id, localId);
            setIsFavorito(resultado.isFavorito);
        } catch (error) {
            console.error('Erro ao verificar favorito:', error);
        }
    };

    const carregarAvaliacoes = async () => {
        try {
            const data = await AvaliacaoService.listarPorLocal(localId);
            setAvaliacoes(data);
            
            // Verificar se o usuário já avaliou
            if (user) {
                const avaliacaoExistente = data.find(a => a.usuario_id === user.id);
                if (avaliacaoExistente) {
                    setAvaliacaoUsuario(avaliacaoExistente);
                    setNotaAvaliacao(avaliacaoExistente.nota);
                    setComentarioAvaliacao(avaliacaoExistente.comentario || '');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
        }
    };

    const toggleFavorito = async () => {
        if (!user) {
            Alert.alert('Aviso', 'Faça login para adicionar aos favoritos');
            return;
        }

        try {
            if (isFavorito) {
                await FavoritoService.removerPorLocalUsuario(user.id, localId);
                setIsFavorito(false);
            } else {
                await FavoritoService.adicionar({ usuario_id: user.id, local_id: localId });
                setIsFavorito(true);
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao atualizar favoritos');
        }
    };

    const abrirLink = (url: string) => {
        Linking.openURL(url).catch(() => {
            Alert.alert('Erro', 'Não foi possível abrir o link');
        });
    };

    const abrirRota = () => {
        if (!local) return;

        // Verifica se tem coordenadas
        if (local.latitude && local.longitude) {
            // Abre Google Maps com rota
            const url = `https://www.google.com/maps/dir/?api=1&destination=${local.latitude},${local.longitude}`;
            Linking.openURL(url).catch(() => {
                Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
            });
        } else {
            // Se não tem coordenadas, busca pelo endereço
            const endereco = `${local.endereco_logradouro}, ${local.endereco_numero || ''}, ${local.endereco_cidade}, ${local.endereco_estado}`;
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
            Linking.openURL(url).catch(() => {
                Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
            });
        }
    };

    const calcularMediaAvaliacoes = (): number => {
        if (!local?.avaliacoes || local.avaliacoes.length === 0) return 0;
        const soma = local.avaliacoes.reduce((acc, aval) => acc + aval.nota, 0);
        return parseFloat((soma / local.avaliacoes.length).toFixed(1));
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesome
                    key={i}
                    name={i <= rating ? 'star' : 'star-o'}
                    size={18}
                    color="#FFD700"
                    style={{ marginRight: 4 }}
                />
            );
        }
        return stars;
    };

    const getDiaSemana = (dia: number): string => {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return dias[dia];
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await carregarLocal();
        await verificarFavorito();
        await carregarAvaliacoes();
        setRefreshing(false);
    };

    const handleAvaliar = () => {
        if (!user) {
            Alert.alert('Aviso', 'Faça login para avaliar este local');
            return;
        }
        setShowAvaliacaoForm(true);
    };

    const handleSalvarAvaliacao = async () => {
        if (!user) return;

        if (notaAvaliacao < 1 || notaAvaliacao > 5) {
            Alert.alert('Erro', 'A nota deve estar entre 1 e 5');
            return;
        }

        try {
            setSalvandoAvaliacao(true);

            if (avaliacaoUsuario) {
                // Atualizar avaliação existente
                await AvaliacaoService.atualizar(avaliacaoUsuario.id, {
                    nota: notaAvaliacao,
                    comentario: comentarioAvaliacao.trim() || undefined,
                });
                Alert.alert('Sucesso', 'Avaliação atualizada com sucesso!');
            } else {
                // Criar nova avaliação
                await AvaliacaoService.criar({
                    usuario_id: user.id,
                    local_id: localId,
                    nota: notaAvaliacao,
                    comentario: comentarioAvaliacao.trim() || undefined,
                });
                Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
            }

            setShowAvaliacaoForm(false);
            await carregarAvaliacoes();
            await carregarLocal(); // Recarregar para atualizar a média
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar avaliação');
        } finally {
            setSalvandoAvaliacao(false);
        }
    };

    const handleCancelarAvaliacao = () => {
        setShowAvaliacaoForm(false);
        // Restaurar valores se já tinha avaliação
        if (avaliacaoUsuario) {
            setNotaAvaliacao(avaliacaoUsuario.nota);
            setComentarioAvaliacao(avaliacaoUsuario.comentario || '');
        } else {
            setNotaAvaliacao(5);
            setComentarioAvaliacao('');
        }
    };

    const renderStarsInteractive = (nota: number, setNota: (n: number) => void) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => setNota(i)}>
                    <FontAwesome
                        name={i <= nota ? 'star' : 'star-o'}
                        size={32}
                        color="#FFD700"
                        style={{ marginHorizontal: 4 }}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Navbar title="Detalhes" showBack={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Carregando...
                    </Text>
                </View>
            </View>
        );
    }

    if (!local) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Navbar title="Detalhes" showBack={true} />
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="error-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Local não encontrado
                    </Text>
                </View>
            </View>
        );
    }

    const mediaAvaliacoes = calcularMediaAvaliacoes();
    const imagens = local.medias?.filter(m => m.tipo === 'IMG') || [];
    const videos = local.medias?.filter(m => m.tipo === 'VID') || [];
    const imagemAtual = URL_UPLOADS + imagens[currentImageIndex]?.url || 'https://via.placeholder.com/400x300?text=Sem+Imagem';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar
                title={local.nome}
                showBack={true}
            />

            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
            >
                {/* Carrossel de Imagens */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imagemAtual }}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />

                    {/* Botão Favorito */}
                    <TouchableOpacity
                        style={[styles.favoriteButton, { backgroundColor: theme.surface }]}
                        onPress={toggleFavorito}
                    >
                        <FontAwesome
                            name={isFavorito ? 'heart' : 'heart-o'}
                            size={24}
                            color={isFavorito ? '#ff4458' : theme.text}
                        />
                    </TouchableOpacity>

                    {/* Indicadores de imagem */}
                    {imagens.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {imagens.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setCurrentImageIndex(index)}
                                    style={[
                                        styles.indicator,
                                        index === currentImageIndex && styles.activeIndicator
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    {/* Navegação de imagens */}
                    {imagens.length > 1 && (
                        <>
                            {currentImageIndex > 0 && (
                                <TouchableOpacity
                                    style={[styles.navButton, styles.prevButton]}
                                    onPress={() => setCurrentImageIndex(currentImageIndex - 1)}
                                >
                                    <Ionicons name="chevron-back" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {currentImageIndex < imagens.length - 1 && (
                                <TouchableOpacity
                                    style={[styles.navButton, styles.nextButton]}
                                    onPress={() => setCurrentImageIndex(currentImageIndex + 1)}
                                >
                                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Informações Principais */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.title, { color: theme.text }]}>{local.nome}</Text>

                    {/* Avaliação */}
                    {local.avaliacoes && local.avaliacoes.length > 0 && (
                        <View style={styles.ratingContainer}>
                            <View style={styles.starsContainer}>
                                {renderStars(Math.round(mediaAvaliacoes))}
                            </View>
                            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                                {mediaAvaliacoes} ({local.avaliacoes.length} avaliações)
                            </Text>
                        </View>
                    )}

                    {/* Descrição */}
                    {local.descricao && (
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            {local.descricao}
                        </Text>
                    )}
                </View>

                {/* Localização */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={24} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Localização</Text>
                    </View>
                    <Text style={[styles.address, { color: theme.textSecondary }]}>
                        {local.endereco_logradouro}
                        {local.endereco_numero && `, ${local.endereco_numero}`}
                        {local.endereco_complemento && ` - ${local.endereco_complemento}`}
                        {'\n'}
                        {local.endereco_bairro && `${local.endereco_bairro}, `}
                        {local.endereco_cidade} - {local.endereco_estado}
                        {local.endereco_cep && `\nCEP: ${local.endereco_cep}`}
                    </Text>
                    
                    <TouchableOpacity
                        style={[styles.routeButton, { backgroundColor: theme.primary }]}
                        onPress={abrirRota}
                    >
                        <Ionicons name="navigate" size={20} color="#fff" />
                        <Text style={styles.routeButtonText}>Como Chegar</Text>
                    </TouchableOpacity>
                </View>

                {/* Horário de Funcionamento */}
                {local.horarios && local.horarios.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time" size={24} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Horário de Funcionamento
                            </Text>
                        </View>
                        {local.horarios.map((horario) => (
                            <View key={horario.dia} style={styles.horarioRow}>
                                <Text style={[styles.horarioDia, { color: theme.text }]}>
                                    {getDiaSemana(horario.dia)}
                                </Text>
                                <Text style={[styles.horarioHora, { color: theme.textSecondary }]}>
                                    {horario.fechado
                                        ? 'Fechado'
                                        : `${horario.hora_abertura} - ${horario.hora_fechamento}`
                                    }
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Amenidades */}
                {local.amenidades && local.amenidades.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="local-offer" size={24} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Comodidades</Text>
                        </View>
                        <View style={styles.amenidadesContainer}>
                            {local.amenidades.map((item) => (
                                <View
                                    key={item.amenidade.id}
                                    style={[styles.amenidadeTag, { backgroundColor: theme.background }]}
                                >
                                    <Text style={[styles.amenidadeText, { color: theme.text }]}>
                                        {item.amenidade.nome}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Contato */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call" size={24} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contato</Text>
                    </View>

                    {local.telefone_contato && (
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() => abrirLink(`tel:${local.telefone_contato}`)}
                        >
                            <Ionicons name="call-outline" size={20} color={theme.primary} />
                            <Text style={[styles.contactText, { color: theme.text }]}>
                                {local.telefone_contato}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {local.email_contato && (
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() => abrirLink(`mailto:${local.email_contato}`)}
                        >
                            <Ionicons name="mail-outline" size={20} color={theme.primary} />
                            <Text style={[styles.contactText, { color: theme.text }]}>
                                {local.email_contato}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {local.site && (
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() => abrirLink(local.site!)}
                        >
                            <Ionicons name="globe-outline" size={20} color={theme.primary} />
                            <Text style={[styles.contactText, { color: theme.text }]}>
                                {local.site}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Redes Sociais */}
                {local.redes && local.redes.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="share-social" size={24} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Redes Sociais</Text>
                        </View>
                        <View style={styles.socialContainer}>
                            {local.redes[0].instagram && (
                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                                    onPress={() => abrirLink(local.redes![0].instagram!)}
                                >
                                    <FontAwesome name="instagram" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {local.redes[0].facebook && (
                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                                    onPress={() => abrirLink(local.redes![0].facebook!)}
                                >
                                    <FontAwesome name="facebook" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                            {local.redes[0].whatsapp && (
                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#25D366' }]}
                                    onPress={() => abrirLink(`https://wa.me/${local.redes![0].whatsapp}`)}
                                >
                                    <FontAwesome name="whatsapp" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Vídeos */}
                {videos.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="videocam" size={24} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Vídeos</Text>
                        </View>
                        {videos.map((video, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.videoItem, { backgroundColor: theme.background }]}
                                onPress={() => abrirLink(video.url)}
                            >
                                <Ionicons name="play-circle" size={32} color={theme.primary} />
                                <Text style={[styles.videoText, { color: theme.text }]}>
                                    Vídeo {index + 1}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Avaliações */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="star" size={24} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Avaliações ({avaliacoes.length})
                        </Text>
                    </View>

                    {/* Média das avaliações */}
                    {avaliacoes.length > 0 && (
                        <View style={styles.mediaContainer}>
                            <View style={styles.mediaScore}>
                                <Text style={[styles.mediaNumber, { color: theme.text }]}>
                                    {mediaAvaliacoes.toFixed(1)}
                                </Text>
                                <View style={styles.starsContainer}>
                                    {renderStars(Math.round(mediaAvaliacoes))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Botão para avaliar */}
                    {!showAvaliacaoForm && (
                        <TouchableOpacity
                            style={[styles.avaliarButton, { backgroundColor: theme.primary }]}
                            onPress={handleAvaliar}
                        >
                            <FontAwesome name="star" size={18} color="#fff" />
                            <Text style={styles.avaliarButtonText}>
                                {avaliacaoUsuario ? 'Editar minha avaliação' : 'Avaliar este local'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Formulário de avaliação */}
                    {showAvaliacaoForm && (
                        <View style={[styles.avaliacaoForm, { backgroundColor: theme.background }]}>
                            <Text style={[styles.formLabel, { color: theme.text }]}>
                                Sua nota:
                            </Text>
                            <View style={styles.starsInteractive}>
                                {renderStarsInteractive(notaAvaliacao, setNotaAvaliacao)}
                            </View>

                            <Text style={[styles.formLabel, { color: theme.text, marginTop: 16 }]}>
                                Comentário (opcional):
                            </Text>
                            <Input
                                placeholder="Compartilhe sua experiência..."
                                value={comentarioAvaliacao}
                                onChangeText={setComentarioAvaliacao}
                                multiline
                                numberOfLines={4}
                                style={{ minHeight: 100, textAlignVertical: 'top' }}
                            />

                            <View style={styles.formButtons}>
                                <TouchableOpacity
                                    style={[styles.formButton, styles.cancelButton, { borderColor: theme.border }]}
                                    onPress={handleCancelarAvaliacao}
                                    disabled={salvandoAvaliacao}
                                >
                                    <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.formButton, styles.saveButton, { backgroundColor: theme.primary }]}
                                    onPress={handleSalvarAvaliacao}
                                    disabled={salvandoAvaliacao}
                                >
                                    {salvandoAvaliacao ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Enviar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Lista de avaliações */}
                    {avaliacoes.length > 0 ? (
                        <View style={styles.avaliacoesList}>
                            <Text style={[styles.avaliacoesTitle, { color: theme.text }]}>
                                Comentários:
                            </Text>
                            {avaliacoes.map((avaliacao) => (
                                <View
                                    key={avaliacao.id}
                                    style={[styles.avaliacaoItem, { backgroundColor: theme.background }]}
                                >
                                    <View style={styles.avaliacaoHeader}>
                                        <View style={styles.starsContainer}>
                                            {renderStars(avaliacao.nota)}
                                        </View>
                                        <Text style={[styles.avaliacaoData, { color: theme.textSecondary }]}>
                                            {avaliacao.criado_em
                                                ? new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')
                                                : ''
                                            }
                                        </Text>
                                    </View>
                                    {avaliacao.comentario && (
                                        <Text style={[styles.avaliacaoComentario, { color: theme.text }]}>
                                            {avaliacao.comentario}
                                        </Text>
                                    )}
                                    {avaliacao.usuario_id === user?.id && (
                                        <View style={styles.minhaAvaliacaoBadge}>
                                            <Text style={[styles.minhaAvaliacaoText, { color: theme.primary }]}>
                                                Sua avaliação
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={[styles.semAvaliacoesText, { color: theme.textSecondary }]}>
                            Seja o primeiro a avaliar este local!
                        </Text>
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        textAlign: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#fff',
        width: 24,
    },
    navButton: {
        position: 'absolute',
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prevButton: {
        left: 16,
    },
    nextButton: {
        right: 16,
    },
    section: {
        marginTop: 12,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    address: {
        fontSize: 15,
        lineHeight: 22,
    },
    routeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    routeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    horarioRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    horarioDia: {
        fontSize: 15,
        fontWeight: '600',
        width: 60,
    },
    horarioHora: {
        fontSize: 15,
        flex: 1,
        textAlign: 'right',
    },
    amenidadesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    amenidadeTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    amenidadeText: {
        fontSize: 14,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactText: {
        fontSize: 15,
        marginLeft: 12,
    },
    socialContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    videoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    videoText: {
        fontSize: 15,
        marginLeft: 12,
    },
    mediaContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginBottom: 16,
    },
    mediaScore: {
        alignItems: 'center',
    },
    mediaNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    avaliarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    avaliarButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    avaliacaoForm: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    starsInteractive: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    formButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    formButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 2,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    avaliacoesList: {
        marginTop: 16,
    },
    avaliacoesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    avaliacaoItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    avaliacaoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    avaliacaoData: {
        fontSize: 12,
    },
    avaliacaoComentario: {
        fontSize: 15,
        lineHeight: 22,
        marginTop: 8,
    },
    minhaAvaliacaoBadge: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    minhaAvaliacaoText: {
        fontSize: 12,
        fontWeight: '600',
    },
    semAvaliacoesText: {
        fontSize: 15,
        textAlign: 'center',
        paddingVertical: 24,
        fontStyle: 'italic',
    },
});

export default LocalDetailsScreen;
