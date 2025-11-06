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
    Image,
    ActivityIndicator,
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

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function LocadorAddLocalScreen({ navigation, route }: any) {
    const { theme } = useTheme();
    const { locadorId } = route.params;

    // Informações básicas
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    
    // Endereço
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('Manaus');
    const [estado, setEstado] = useState('AM');
    const [cep, setCep] = useState('');
    
    // Contato
    const [telefone, setTelefone] = useState('');
    const [emailContato, setEmailContato] = useState('');
    const [site, setSite] = useState('');
    
    // Redes sociais
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    
    // Fotos
    const [fotos, setFotos] = useState<string[]>([]);
    
    // Localização
    const [latitude, setLatitude] = useState<number>();
    const [longitude, setLongitude] = useState<number>();
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Limpar formulário em caso de refresh
        setNome('');
        setDescricao('');
        setLogradouro('');
        setNumero('');
        setComplemento('');
        setBairro('');
        setCidade('Manaus');
        setEstado('AM');
        setCep('');
        setTelefone('');
        setEmailContato('');
        setSite('');
        setInstagram('');
        setFacebook('');
        setWhatsapp('');
        setFotos([]);
        setLatitude(undefined);
        setLongitude(undefined);
        
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

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

    const handleSelecionarFotos = async () => {
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
            const novasFotos = result.assets.map(asset => asset.uri);
            setFotos([...fotos, ...novasFotos]);
        }
    };

    const handleRemoverFoto = (index: number) => {
        setFotos(fotos.filter((_, i) => i !== index));
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

    const handleSalvar = async () => {
        // Validações
        if (!nome || !logradouro || !cidade || !estado) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
            return;
        }

        if (fotos.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos uma foto do local');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload das fotos
            const fotosUpload = await UploadService.uploadMultiple(fotos);

            // 2. Criar o local
            const localData = {
                dono_id: locadorId,
                nome,
                descricao: descricao || undefined,
                endereco_logradouro: logradouro,
                endereco_numero: numero || undefined,
                endereco_complemento: complemento || undefined,
                endereco_bairro: bairro || undefined,
                endereco_cidade: cidade,
                endereco_estado: estado,
                endereco_cep: cep.replace(/\D/g, '') || undefined,
                endereco_pais: 'BR',
                latitude,
                longitude,
                telefone_contato: telefone.replace(/\D/g, '') || undefined,
                email_contato: emailContato || undefined,
                site: site || undefined,
                medias: fotosUpload.map((foto, index) => ({
                    url: foto.url,
                    tipo: 'IMG' as const,
                    ordem: index,
                })),
                redes: (instagram || facebook || whatsapp) ? {
                    instagram: instagram || undefined,
                    facebook: facebook || undefined,
                    whatsapp: whatsapp.replace(/\D/g, '') || undefined,
                } : undefined,
            };

            await LocalService.criar(localData);

            Alert.alert('Sucesso', 'Local cadastrado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Erro ao cadastrar local');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={theme.white} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.white }]}>Novo Local</Text>
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
                            Fotos *
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fotosContainer}>
                            {fotos.map((foto, index) => (
                                <View key={index} style={styles.fotoWrapper}>
                                    <Image source={{ uri: foto }} style={styles.foto} />
                                    <TouchableOpacity
                                        style={[styles.removerFotoButton, { backgroundColor: theme.error }]}
                                        onPress={() => handleRemoverFoto(index)}
                                    >
                                        <FontAwesome name="times" size={12} color={theme.white} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={[styles.addFotoButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
                                onPress={handleSelecionarFotos}
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

                    <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                        * Campos obrigatórios
                    </Text>

                    <Button
                        title="Cadastrar Local"
                        onPress={handleSalvar}
                        loading={loading}
                        disabled={loading}
                    />
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
    helperText: {
        fontSize: 12,
        marginBottom: 16,
    },
    cepLoader: {
        position: 'absolute',
        right: 16,
        top: 20,
    },
});
