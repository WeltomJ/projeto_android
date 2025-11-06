import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { GoogleMaps, AppleMaps } from 'expo-maps';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

interface LocationPickerProps {
    visible: boolean;
    initialLatitude?: number;
    initialLongitude?: number;
    onSelectLocation: (latitude: number, longitude: number) => void;
    onCancel: () => void;
}

export default function LocationPicker({
    visible,
    initialLatitude,
    initialLongitude,
    onSelectLocation,
    onCancel
}: LocationPickerProps) {
    const { theme } = useTheme();
    
    // Coordenadas padrão (centro de Manaus)
    const defaultLat = -3.1190;
    const defaultLng = -60.0217;
    
    const [region, setRegion] = useState({
        latitude: initialLatitude || defaultLat,
        longitude: initialLongitude || defaultLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const [centerCoordinates, setCenterCoordinates] = useState({
        latitude: initialLatitude || defaultLat,
        longitude: initialLongitude || defaultLng,
    });

    useEffect(() => {
        if (initialLatitude && initialLongitude) {
            setRegion(prev => ({
                ...prev,
                latitude: initialLatitude,
                longitude: initialLongitude,
            }));
            setCenterCoordinates({
                latitude: initialLatitude,
                longitude: initialLongitude,
            });
        }
    }, [initialLatitude, initialLongitude]);

    const handleCameraChange = (event: any) => {
        if (event?.coordinates) {
            setCenterCoordinates({
                latitude: event.coordinates.latitude,
                longitude: event.coordinates.longitude,
            });
        }
    };

    const handleConfirm = () => {
        onSelectLocation(centerCoordinates.latitude, centerCoordinates.longitude);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onCancel}
        >
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.primary }]}>
                    <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                        <FontAwesome name="times" size={24} color={theme.white} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.white }]}>
                        Selecionar Localização
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Instruções */}
                <View style={[styles.instructions, { backgroundColor: theme.surface }]}>
                    <FontAwesome name="info-circle" size={20} color={theme.primary} />
                    <Text style={[styles.instructionsText, { color: theme.text }]}>
                        Mova o mapa para posicionar o marcador no local exato do estabelecimento
                    </Text>
                </View>

                {/* Mapa */}
                <View style={styles.mapContainer}>
                    {Platform.OS === 'ios' ? (
                        <AppleMaps.View
                            style={styles.map}
                            cameraPosition={{
                                coordinates: {
                                    latitude: region.latitude,
                                    longitude: region.longitude
                                },
                                zoom: 16,
                            }}
                            onCameraMove={handleCameraChange}
                        />
                    ) : (
                        <GoogleMaps.View
                            style={styles.map}
                            cameraPosition={{
                                coordinates: {
                                    latitude: region.latitude,
                                    longitude: region.longitude
                                },
                                zoom: 16,
                            }}
                            onCameraMove={handleCameraChange}
                        />
                    )}
                    
                    {/* Marcador fixo no centro */}
                    <View style={styles.centerMarker} pointerEvents="none">
                        <FontAwesome name="map-marker" size={48} color="#FF0000" />
                    </View>
                </View>

                {/* Coordenadas selecionadas */}
                <View style={[styles.coordsContainer, { backgroundColor: theme.surface }]}>
                    <FontAwesome name="map-marker" size={20} color={theme.primary} />
                    <View style={styles.coordsText}>
                        <Text style={[styles.coordsLabel, { color: theme.textSecondary }]}>
                            Coordenadas:
                        </Text>
                        <Text style={[styles.coordsValue, { color: theme.text }]}>
                            {centerCoordinates.latitude.toFixed(7)}, {centerCoordinates.longitude.toFixed(7)}
                        </Text>
                    </View>
                </View>

                {/* Botões */}
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton, { backgroundColor: theme.primary }]}
                        onPress={handleConfirm}
                    >
                        <Text style={[styles.confirmButtonText, { color: theme.white }]}>
                            Confirmar
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    instructions: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    instructionsText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    mapContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    centerMarker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -24,
        marginTop: -48,
        zIndex: 1,
    },
    coordsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
        gap: 12,
    },
    coordsText: {
        flex: 1,
    },
    coordsLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    coordsValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
