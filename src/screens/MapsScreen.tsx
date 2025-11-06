import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert, RefreshControl, ScrollView } from 'react-native';
import MapsView from '../components/MapView';
import Navbar from '../components/Navbar';
import { useTheme } from '../utils/ThemeContext';
import { Local } from '../../types/Local';
import { LocalService } from '../services/Local.Service';
import { useLocationPermission } from '../hooks/useLocationPermission';

export default function MapScreen() {
    const { theme } = useTheme();
    const { location } = useLocationPermission();
    const [locais, setLocais] = useState<Local[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    useEffect(() => {
        carregarLocais();
    }, [location]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregarLocais();
        setRefreshing(false);
    }, [location]);

    const carregarLocais = async () => {
        try {
            setLoading(true);
            let resultado: Local[];

            // Se temos a localização do usuário, buscar locais próximos
            if (location?.coords) {
                resultado = await LocalService.buscarPorProximidade(
                    location.coords.latitude,
                    location.coords.longitude,
                    20
                );
            } else {
                // Caso contrário, listar todos os locais
                resultado = await LocalService.listar();
            }
            
            setLocais(resultado);
        } catch (error: any) {
            console.error('Erro ao carregar locais:', error);
            Alert.alert(
                'Erro',
                'Não foi possível carregar os locais. Tente novamente.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleMarkerPress = (local: Local) => {
        Alert.alert(
            local.nome,
            `${local.descricao || ''}\n\n${local.endereco_logradouro}${local.endereco_numero ? ', ' + local.endereco_numero : ''}`,
            [
                { text: 'Fechar', style: 'cancel' },
                // Você pode adicionar mais ações aqui, como navegação para detalhes
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar title="Mapa" />
            <ScrollView
                style={styles.mapContainer}
                contentContainerStyle={{ flex: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={[styles.loadingText, { color: theme.text }]}>
                            Carregando locais...
                        </Text>
                    </View>
                ) : (
                    <MapsView 
                        locais={locais}
                        onMarkerPress={handleMarkerPress}
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
        padding: 16,
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
});