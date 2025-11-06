import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { useTheme } from '../utils/ThemeContext';
import { Local } from '../../types/Local';

interface MapsViewProps {
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    locais?: Local[];
    onMarkerPress?: (local: Local) => void;
}

export default function MapsView({ initialRegion, locais = [], onMarkerPress }: MapsViewProps) {
    const { location, permissionGranted } = useLocationPermission();
    const { theme, getThemeMode } = useTheme();

    const defaultRegion = {
        latitude: -3.1190,
        longitude: -60.0217,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    // Preparar marcadores válidos a partir dos locais cadastrados
    const markerPoints = useMemo(() => (
        locais
            .filter(local => local.latitude != null && local.longitude != null)
            .map(local => ({
                id: local.id.toString(),
                latitude: Number(local.latitude),
                longitude: Number(local.longitude),
                title: local.nome,
                snippet: local.descricao || local.endereco_logradouro,
            }))
    ), [locais]);

    // Ajustar a região da câmera para englobar marcadores (e usuário, se existir)
    const region = useMemo(() => {
        if (markerPoints.length > 0) {
            let minLat = markerPoints[0].latitude;
            let maxLat = markerPoints[0].latitude;
            let minLng = markerPoints[0].longitude;
            let maxLng = markerPoints[0].longitude;

            markerPoints.forEach(point => {
                minLat = Math.min(minLat, point.latitude);
                maxLat = Math.max(maxLat, point.latitude);
                minLng = Math.min(minLng, point.longitude);
                maxLng = Math.max(maxLng, point.longitude);
            });

            if (location) {
                minLat = Math.min(minLat, location.coords.latitude);
                maxLat = Math.max(maxLat, location.coords.latitude);
                minLng = Math.min(minLng, location.coords.longitude);
                maxLng = Math.max(maxLng, location.coords.longitude);
            }

            const latDelta = Math.max(maxLat - minLat, 0.01);
            const lngDelta = Math.max(maxLng - minLng, 0.01);
            const padding = 0.01;

            return {
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: latDelta + padding,
                longitudeDelta: lngDelta + padding,
            };
        }

        if (location) {
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
        }

        return initialRegion || defaultRegion;
    }, [markerPoints, location, initialRegion]);

    const cameraPosition = useMemo(() => ({
        coordinates: {
            latitude: region.latitude,
            longitude: region.longitude
        },
        zoom: (() => {
            const span = Math.max(region.latitudeDelta, region.longitudeDelta);
            if (span <= 0.02) return 16;
            if (span <= 0.05) return 14;
            if (span <= 0.1) return 13;
            if (span <= 0.5) return 11;
            if (span <= 1) return 10;
            return 8;
        })(),
    }), [region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta]);

    const googleUserLocation = useMemo(() => {
        if (!permissionGranted || !location) {
            return undefined;
        }

        return {
            coordinates: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
            followUserLocation: false,
        };
    }, [location, permissionGranted]);

    // Converter pontos em estrutura de marcadores esperada pelo componente
    const markers = useMemo(() => (
        markerPoints.map(point => ({
            id: point.id,
            coordinates: {
                latitude: point.latitude,
                longitude: point.longitude,
            },
            title: point.title,
            snippet: point.snippet,
        }))
    ), [markerPoints]);

    // Propriedades do Google Maps
    const googleMapsProperties = useMemo(() => ({
        isMyLocationEnabled: permissionGranted,
    }), [permissionGranted]);

    if (Platform.OS === 'ios') {
        return (
            <View style={[styles.container, { shadowColor: theme.shadow }]}>
                <AppleMaps.View 
                    style={styles.map}
                    cameraPosition={cameraPosition}
                    properties={{ isMyLocationEnabled: permissionGranted }}
                    markers={markers}
                />
            </View>
        );
    } else if (Platform.OS === 'android') {
        return (
            <View style={[styles.container, { shadowColor: theme.shadow }]}>
                <GoogleMaps.View 
                    style={styles.map}
                    cameraPosition={cameraPosition}
                    properties={googleMapsProperties}
                    userLocation={googleUserLocation}
                    colorScheme={getThemeMode()}
                    markers={markers}
                />
            </View>
        );
    } else {
        return <Text>Maps are only available on Android and iOS</Text>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    map: {
        flex: 1,
    },
});