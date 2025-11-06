import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Input from '../components/Input';
import Button from '../components/Button';
import LocationPicker from '../components/LocationPicker';
import { useTheme } from '../utils/ThemeContext';
import { LocalService } from '../services/Local.Service';
import { UploadService } from '../services/Upload.Service';
import { CepService } from '../services/Cep.Service';
import { Local } from '../../types/Local';
import { Media, HorarioAbertura, Amenidade } from '../../types/LocalExtra';
import api from '../services/api.config';
import { URL_UPLOADS } from '@env';

export default function LocadorEditLocalScreen({ navigation, route }: any) {
    const { theme } = useTheme();
    const { localId } = route.params;

    const [local, setLocal] = useState<Local | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Informações básicas
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    
    // Endereço
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');
    
    // Contato
    const [telefone, setTelefone] = useState('');
    const [emailContato, setEmailContato] = useState('');
    const [site, setSite] = useState('');
    
    // Redes sociais
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    
    // Fotos existentes e novas
    const [fotosExistentes, setFotosExistentes] = useState<Media[]>([]);
    const [novasFotos, setNovasFotos] = useState<string[]>([]);
    const [loadingCep, setLoadingCep] = useState(false);
    
    // Localização
    const [latitude, setLatitude] = useState<number>();
    const [longitude, setLongitude] = useState<number>();
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    
    // Horários
    const [horarios, setHorarios] = useState<HorarioAbertura[]>([]);
    const [showHorarios, setShowHorarios] = useState(false);
    
    // Amenidades
    const [amenidadesDisponiveis, setAmenidadesDisponiveis] = useState<Amenidade[]>([]);
    const [amenidadesSelecionadas, setAmenidadesSelecionadas] = useState<number[]>([]);
    const [showAmenidades, setShowAmenidades] = useState(false);

    const carregarLocal = useCallback(async () => {
        try {
            const data = await LocalService.obter(localId);
            setLocal(data);
            
            // Preencher campos
            setNome(data.nome || '');
            setDescricao(data.descricao || '');
            setLogradouro(data.endereco_logradouro || '');
            setNumero(data.endereco_numero || '');
            setComplemento(data.endereco_complemento || '');
            setBairro(data.endereco_bairro || '');
            setCidade(data.endereco_cidade || 'Manaus');
            setEstado(data.endereco_estado || 'AM');
            setCep(formatarCEP(data.endereco_cep || ''));
            setTelefone(formatarTelefone(data.telefone_contato || ''));
            setEmailContato(data.email_contato || '');
            setSite(data.site || '');
            setLatitude(data.latitude || undefined);
            setLongitude(data.longitude || undefined);
            
            if (data.redes && data.redes.length > 0) {
                setInstagram(data.redes[0].instagram || '');
                setFacebook(data.redes[0].facebook || '');
                setWhatsapp(formatarTelefone(data.redes[0].whatsapp || ''));
            }
            
            if (data.medias && data.medias.length > 0) {
                setFotosExistentes(data.medias);
            }
            
            if (data.horarios) {
                setHorarios(data.horarios);
            }
            
            if (data.amenidades) {
                const ids = data.amenidades.map(a => a.amenidade.id);
                setAmenidadesSelecionadas(ids);
            }
            
            // Carregar amenidades disponíveis
            await carregarAmenidades();
        } catch (error: any) {
            Alert.alert('Erro', 'Erro ao carregar local');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }, [localId, navigation]);
    
    const carregarAmenidades = async () => {
        try {
            const response = await api.get<Amenidade[]>('/amenidade');
            setAmenidadesDisponiveis(response.data);
        } catch (error) {
            console.error('Erro ao carregar amenidades:', error);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await carregarLocal();
        } catch (error) {
            console.error('Erro ao atualizar:', error);
        } finally {
            setRefreshing(false);
        }
    }, [carregarLocal]);

    useEffect(() => {
        carregarLocal();
    }, [carregarLocal]);

    const formatarCEP = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 5) {
            return cleaned;
        }
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    };

    const formatarTelefone = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length === 0) {
            return '';
        } else if (cleaned.length <= 2) {
            return `(${cleaned}`;
        } else if (cleaned.length <= 7) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        } else if (cleaned.length <= 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
        } else {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        }
    };

    const buscarCep = async (cepValue: string) => {
        const cepLimpo = cepValue.replace(/\D/g, '');
        
        if (cepLimpo.length === 8) {
            setLoadingCep(true);
            try {
                const dadosCep = await CepService.buscarPorCep(cepLimpo);
                
                if (dadosCep) {
                    setLogradouro(dadosCep.logradouro || '');
                    setBairro(dadosCep.bairro || '');
                    setCidade(dadosCep.localidade || 'Manaus');
                    setEstado(dadosCep.uf || 'AM');
                    
                    // Tentar obter coordenadas baseadas no endereço
                    const enderecoCompleto = CepService.formatarEndereco(
                        dadosCep.logradouro,
                        numero,
                        dadosCep.bairro,
                        dadosCep.localidade,
                        dadosCep.uf
                    );
                    
                    const coordenadas = await CepService.obterCoordenadas(enderecoCompleto);
                    if (coordenadas) {
                        setLatitude(coordenadas.lat);
                        setLongitude(coordenadas.lng);
                    }
                } else {
                    Alert.alert(
                        'CEP não encontrado',
                        'O CEP informado não foi encontrado. Você pode preencher o endereço manualmente.'
                    );
                }
            } catch (error) {
                Alert.alert('Erro', 'Erro ao buscar CEP. Tente novamente.');
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleAdicionarFotos = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const fotos = result.assets.map(asset => asset.uri);
            setNovasFotos([...novasFotos, ...fotos]);
        }
    };

    const handleRemoverFotoExistente = async (media: Media) => {
        Alert.alert(
            'Remover Foto',
            'Tem certeza que deseja remover esta foto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await LocalService.removerMedia(localId, media.id);
                            setFotosExistentes(fotosExistentes.filter(f => f.id !== media.id));
                            Alert.alert('Sucesso', 'Foto removida');
                        } catch (error: any) {
                            Alert.alert('Erro', error.message || 'Erro ao remover foto');
                        }
                    },
                },
            ]
        );
    };

    const handleRemoverNovaFoto = (index: number) => {
        setNovasFotos(novasFotos.filter((_, i) => i !== index));
    };

    const handleObterLocalizacao = () => {
        setShowLocationPicker(true);
    };

    const handleSelectLocation = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
        setShowLocationPicker(false);
        Alert.alert('Sucesso', 'Localização selecionada com sucesso!');
    };
    
    const getDiaSemana = (dia: number): string => {
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return dias[dia];
    };
    
    const toggleAmenidade = (amenidadeId: number) => {
        if (amenidadesSelecionadas.includes(amenidadeId)) {
            setAmenidadesSelecionadas(amenidadesSelecionadas.filter(id => id !== amenidadeId));
        } else {
            setAmenidadesSelecionadas([...amenidadesSelecionadas, amenidadeId]);
        }
    };
    
    const salvarHorarios = async () => {
        try {
            // Criar horários padrão se não existirem
            if (horarios.length === 0) {
                const horariosDefault = [0, 1, 2, 3, 4, 5, 6].map(dia => ({
                    dia,
                    hora_abertura: '18:00',
                    hora_fechamento: '23:59',
                    fechado: dia === 0 || dia === 1, // Domingo e segunda fechado por padrão
                }));
                
                for (const horario of horariosDefault) {
                    const novo = await LocalService.adicionarHorario(localId, horario);
                    setHorarios(prev => [...prev, novo]);
                }
            }
            Alert.alert('Sucesso', 'Horários salvos');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao salvar horários');
        }
    };
    
    const atualizarHorario = async (horario: HorarioAbertura, campo: 'hora_abertura' | 'hora_fechamento' | 'fechado', valor: any) => {
        try {
            const atualizado = await LocalService.atualizarHorario(localId, horario.id, {
                [campo]: valor
            });
            setHorarios(horarios.map(h => h.id === horario.id ? atualizado : h));
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao atualizar horário');
        }
    };

    const handleSalvar = async () => {
        if (!nome?.trim()) {
            Alert.alert('Erro', 'O nome do local é obrigatório');
            return;
        }

        if (!cidade?.trim() || !estado?.trim()) {
            Alert.alert('Erro', 'Cidade e Estado são obrigatórios');
            return;
        }

        setSaving(true);
        try {
            // 1. Atualizar informações básicas
            await LocalService.atualizar(localId, {
                nome: nome.trim(),
                descricao: descricao?.trim() || undefined,
                endereco_logradouro: logradouro?.trim() || cidade,
                endereco_numero: numero?.trim() || undefined,
                endereco_complemento: complemento?.trim() || undefined,
                endereco_bairro: bairro?.trim() || undefined,
                endereco_cidade: cidade.trim(),
                endereco_estado: estado.trim(),
                endereco_cep: cep.replace(/\D/g, '') || undefined,
                latitude,
                longitude,
                telefone_contato: telefone.replace(/\D/g, '') || undefined,
                email_contato: emailContato?.trim() || undefined,
                site: site?.trim() || undefined,
            });

            // 2. Upload e adicionar novas fotos
            if (novasFotos.length > 0) {
                const uploads = await UploadService.uploadMultiple(novasFotos);
                
                for (let i = 0; i < uploads.length; i++) {
                    await LocalService.adicionarMedia(localId, {
                        url: uploads[i].url,
                        tipo: 'IMG',
                        ordem: fotosExistentes.length + i,
                    });
                }
            }

            // 3. Atualizar redes sociais
            if (instagram || facebook || whatsapp) {
                await LocalService.atualizarRedes(localId, {
                    instagram: instagram || undefined,
                    facebook: facebook || undefined,
                    whatsapp: whatsapp.replace(/\D/g, '') || undefined,
                });
            }

            // 4. Atualizar amenidades (se houve mudança)
            if (amenidadesSelecionadas.length > 0) {
                await LocalService.atualizar(localId, {
                    amenidades: amenidadesSelecionadas,
                });
            }

            Alert.alert('Sucesso', 'Local atualizado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao atualizar local');
        } finally {
            setSaving(false);
        }
    };

    const handleExcluir = () => {
        Alert.alert(
            'Excluir Local',
            'Tem certeza que deseja excluir este local? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await LocalService.remover(localId);
                            Alert.alert('Sucesso', 'Local excluído com sucesso');
                            navigation.goBack();
                        } catch (error: any) {
                            Alert.alert('Erro', error.message || 'Erro ao excluir local');
                        }
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.white} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.white }]}>Editar Local</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
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
                    {/* Informações Básicas */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Informações Básicas
                        </Text>

                        <Input
                            placeholder="Nome do local *"
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                        />

                        <Input
                            placeholder="Descrição"
                            value={descricao}
                            onChangeText={setDescricao}
                            autoCapitalize="sentences"
                        />
                    </View>

                    {/* Fotos */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Fotos
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotosContainer}>
                            {/* Fotos existentes */}
                            {fotosExistentes.map((media) => (
                                <View key={`existente-${media.id}`} style={styles.fotoWrapper}>
                                    <Image source={{ uri: URL_UPLOADS + media.url }} style={styles.foto} />
                                    <TouchableOpacity
                                        style={[styles.removerFotoButton, { backgroundColor: theme.error }]}
                                        onPress={() => handleRemoverFotoExistente(media)}
                                    >
                                        <FontAwesome name="times" size={12} color={theme.white} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Novas fotos */}
                            {novasFotos.map((foto, index) => (
                                <View key={`nova-${index}`} style={styles.fotoWrapper}>
                                    <Image source={{ uri: foto }} style={styles.foto} />
                                    <TouchableOpacity
                                        style={[styles.removerFotoButton, { backgroundColor: theme.error }]}
                                        onPress={() => handleRemoverNovaFoto(index)}
                                    >
                                        <FontAwesome name="times" size={12} color={theme.white} />
                                    </TouchableOpacity>
                                    <View style={[styles.novaBadge, { backgroundColor: theme.success }]}>
                                        <Text style={styles.novaBadgeText}>NOVA</Text>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={[styles.addFotoButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                                onPress={handleAdicionarFotos}
                            >
                                <FontAwesome name="camera" size={24} color={theme.primary} />
                                <Text style={[styles.addFotoText, { color: theme.textSecondary }]}>
                                    Adicionar
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Endereço */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Endereço
                        </Text>

                        <Input
                            placeholder="Logradouro *"
                            value={logradouro}
                            onChangeText={setLogradouro}
                            autoCapitalize="words"
                        />

                        <View style={styles.row}>
                            <View style={styles.col70}>
                                <Input
                                    placeholder="Número"
                                    value={numero}
                                    onChangeText={setNumero}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.col30}>
                                <Input
                                    placeholder="Complemento"
                                    value={complemento}
                                    onChangeText={setComplemento}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <Input
                            placeholder="Bairro"
                            value={bairro}
                            onChangeText={setBairro}
                            autoCapitalize="words"
                        />

                        <View style={styles.row}>
                            <View style={styles.col70}>
                                <Input
                                    placeholder="Cidade *"
                                    value={cidade}
                                    onChangeText={setCidade}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.col30}>
                                <Input
                                    placeholder="UF *"
                                    value={estado}
                                    onChangeText={(text) => setEstado(text.toUpperCase().slice(0, 2))}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>

                        <View style={{ position: 'relative' }}>
                            <Input
                                placeholder="CEP"
                                value={cep}
                                onChangeText={(text) => {
                                    const formatted = formatarCEP(text);
                                    setCep(formatted);
                                    buscarCep(formatted);
                                }}
                                keyboardType="numeric"
                            />
                            {loadingCep && (
                                <ActivityIndicator
                                    style={styles.cepLoader}
                                    size="small"
                                    color={theme.primary}
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.locationButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={handleObterLocalizacao}
                        >
                            <FontAwesome name="map-marker" size={18} color={theme.primary} />
                            <Text style={[styles.locationButtonText, { color: theme.text }]}>
                                {latitude && longitude ? 'Localização selecionada ✓' : 'Selecionar no mapa'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Contato */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Contato
                        </Text>

                        <Input
                            placeholder="Telefone"
                            value={telefone}
                            onChangeText={(text) => setTelefone(formatarTelefone(text))}
                            keyboardType="phone-pad"
                        />

                        <Input
                            placeholder="E-mail"
                            value={emailContato}
                            onChangeText={setEmailContato}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            placeholder="Site"
                            value={site}
                            onChangeText={setSite}
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Redes Sociais */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            Redes Sociais
                        </Text>

                        <Input
                            placeholder="Instagram (@usuario)"
                            value={instagram}
                            onChangeText={setInstagram}
                            autoCapitalize="none"
                        />

                        <Input
                            placeholder="Facebook"
                            value={facebook}
                            onChangeText={setFacebook}
                            autoCapitalize="none"
                        />

                        <Input
                            placeholder="WhatsApp"
                            value={whatsapp}
                            onChangeText={(text) => setWhatsapp(formatarTelefone(text))}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Horários de Funcionamento */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.collapsibleHeader}
                            onPress={() => setShowHorarios(!showHorarios)}
                        >
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Horários de Funcionamento
                            </Text>
                            <FontAwesome
                                name={showHorarios ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={theme.textSecondary}
                            />
                        </TouchableOpacity>

                        {showHorarios && (
                            <>
                                {horarios.length === 0 ? (
                                    <TouchableOpacity
                                        style={[styles.addHorariosButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={salvarHorarios}
                                    >
                                        <FontAwesome name="clock-o" size={18} color={theme.primary} />
                                        <Text style={[styles.addHorariosText, { color: theme.text }]}>
                                            Adicionar Horários
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.horariosContainer}>
                                        {[0, 1, 2, 3, 4, 5, 6].map((dia) => {
                                            const horario = horarios.find(h => h.dia === dia);
                                            return (
                                                <View key={dia} style={[styles.horarioItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                                    <View style={styles.horarioDia}>
                                                        <Text style={[styles.horarioDiaText, { color: theme.text }]}>
                                                            {getDiaSemana(dia)}
                                                        </Text>
                                                        <TouchableOpacity
                                                            onPress={() => horario && atualizarHorario(horario, 'fechado', !horario.fechado)}
                                                        >
                                                            <Text style={[styles.fechadoToggle, { color: horario?.fechado ? theme.error : theme.success }]}>
                                                                {horario?.fechado ? 'Fechado' : 'Aberto'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    {horario && !horario.fechado && (
                                                        <View style={styles.horarioTimes}>
                                                            <TextInput
                                                                style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
                                                                value={horario.hora_abertura}
                                                                onChangeText={(text) => {
                                                                    // Formatar horário
                                                                    const numeros = text.replace(/\D/g, '');
                                                                    let valorFormatado = '';
                                                                    if (!numeros) {
                                                                        valorFormatado = '';
                                                                    } else if (numeros.length <= 2) {
                                                                        valorFormatado = numeros;
                                                                    } else if (numeros.length <= 4) {
                                                                        valorFormatado = `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
                                                                    } else {
                                                                        valorFormatado = `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
                                                                    }
                                                                    atualizarHorario(horario, 'hora_abertura', valorFormatado);
                                                                }}
                                                                placeholder="00:00"
                                                                placeholderTextColor={theme.textSecondary}
                                                                keyboardType="numeric"
                                                                maxLength={5}
                                                            />
                                                            <Text style={[styles.horarioSeparator, { color: theme.textSecondary }]}>até</Text>
                                                            <TextInput
                                                                style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
                                                                value={horario.hora_fechamento}
                                                                onChangeText={(text) => {
                                                                    // Formatar horário
                                                                    const numeros = text.replace(/\D/g, '');
                                                                    let valorFormatado = '';
                                                                    if (!numeros) {
                                                                        valorFormatado = '';
                                                                    } else if (numeros.length <= 2) {
                                                                        valorFormatado = numeros;
                                                                    } else if (numeros.length <= 4) {
                                                                        valorFormatado = `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
                                                                    } else {
                                                                        valorFormatado = `${numeros.slice(0, 2)}:${numeros.slice(2, 4)}`;
                                                                    }
                                                                    atualizarHorario(horario, 'hora_fechamento', valorFormatado);
                                                                }}
                                                                placeholder="00:00"
                                                                placeholderTextColor={theme.textSecondary}
                                                                keyboardType="numeric"
                                                                maxLength={5}
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {/* Amenidades */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.collapsibleHeader}
                            onPress={() => setShowAmenidades(!showAmenidades)}
                        >
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Amenidades
                            </Text>
                            <FontAwesome
                                name={showAmenidades ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={theme.textSecondary}
                            />
                        </TouchableOpacity>

                        {showAmenidades && (
                            <View style={styles.amenidadesContainer}>
                                {amenidadesDisponiveis.map((amenidade) => {
                                    const selecionada = amenidadesSelecionadas.includes(amenidade.id);
                                    return (
                                        <TouchableOpacity
                                            key={amenidade.id}
                                            style={[
                                                styles.amenidadeChip,
                                                {
                                                    backgroundColor: selecionada ? theme.primary : theme.surface,
                                                    borderColor: selecionada ? theme.primary : theme.border,
                                                }
                                            ]}
                                            onPress={() => toggleAmenidade(amenidade.id)}
                                        >
                                            <Text style={[
                                                styles.amenidadeChipText,
                                                { color: selecionada ? theme.white : theme.text }
                                            ]}>
                                                {amenidade.nome}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <Button
                        title="Salvar Alterações"
                        onPress={handleSalvar}
                        loading={saving}
                        disabled={saving}
                    />

                    <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: theme.error }]}
                        onPress={handleExcluir}
                        disabled={saving}
                    >
                        <FontAwesome name="trash" size={16} color={theme.error} />
                        <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                            Excluir Local
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de seleção de localização */}
            <LocationPicker
                visible={showLocationPicker}
                initialLatitude={latitude}
                initialLongitude={longitude}
                onSelectLocation={handleSelectLocation}
                onCancel={() => setShowLocationPicker(false)}
            />
        </View>
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
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    fotosContainer: {
        flexDirection: 'row',
        marginVertical: 8,
    },
    fotoWrapper: {
        position: 'relative',
        marginRight: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    foto: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    removerFotoButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    novaBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    novaBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addFotoButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addFotoText: {
        fontSize: 12,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    col30: {
        flex: 0.3,
    },
    col70: {
        flex: 0.7,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginTop: 16,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cepLoader: {
        position: 'absolute',
        right: 16,
        top: 20,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
        gap: 12,
    },
    locationButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    collapsibleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    addHorariosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    addHorariosText: {
        fontSize: 15,
        fontWeight: '600',
    },
    horariosContainer: {
        gap: 8,
    },
    horarioItem: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    horarioDia: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    horarioDiaText: {
        fontSize: 15,
        fontWeight: '600',
    },
    fechadoToggle: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    horarioTimes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        textAlign: 'center',
    },
    horarioSeparator: {
        fontSize: 14,
    },
    amenidadesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenidadeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    amenidadeChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
