import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { useTheme } from '../utils/ThemeContext';

interface MapsViewProps {
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
}

export default function MapsView({ initialRegion }: MapsViewProps) {
    const { location, permissionGranted } = useLocationPermission();
    const { theme, getThemeMode } = useTheme();

    const defaultRegion = {
        latitude: -3.1190,
        longitude: -60.0217,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const region = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    } : (initialRegion || defaultRegion);

    const cameraPosition = useMemo(() => ({
        coordinates: {
            latitude: region.latitude,
            longitude: region.longitude
        },
        zoom: 15,
    }), [region.latitude, region.longitude]);

    const googleUserLocation = useMemo(() => {
        if (!permissionGranted || !location) {
            return undefined;
        }

        return {
            coordinates: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            },
            followUserLocation: true,
        };
    }, [location, permissionGranted]);

    if (Platform.OS === 'ios') {
        return (
            <View style={[styles.container, { shadowColor: theme.shadow }]}>
                <AppleMaps.View 
                    style={styles.map}
                    cameraPosition={cameraPosition}
                    properties={{ isMyLocationEnabled: permissionGranted }}
                />
            </View>
        );
    } else if (Platform.OS === 'android') {
        return (
            <View style={[styles.container, { shadowColor: theme.shadow }]}>
                <GoogleMaps.View 
                    style={styles.map}
                    cameraPosition={cameraPosition}
                    properties={{ isMyLocationEnabled: permissionGranted }}
                    userLocation={googleUserLocation}
                    colorScheme={getThemeMode()}
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