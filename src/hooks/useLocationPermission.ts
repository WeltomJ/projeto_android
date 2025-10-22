import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { PermissionStatus } from 'expo-modules-core';

export interface UseLocationPermissionResult {
    location: Location.LocationObject | null;
    permissionGranted: boolean;
    status: PermissionStatus;
    isFetching: boolean;
    refresh: () => Promise<Location.LocationObject | null>;
    requestPermission: () => Promise<boolean>;
}

export function useLocationPermission(): UseLocationPermissionResult {
    const [permissionInfo, requestForegroundPermission] = Location.useForegroundPermissions();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    const ensurePermission = useCallback(async () => {
        if (!permissionInfo || permissionInfo.status === PermissionStatus.UNDETERMINED) {
            const permissionResponse = await requestForegroundPermission();
            return permissionResponse?.granted ?? false;
        }

        if (permissionInfo.status === PermissionStatus.DENIED) {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para acessar sua localização.'
            );
            return false;
        }

        return permissionInfo.granted;
    }, [permissionInfo, requestForegroundPermission]);

    const fetchCurrentLocation = useCallback(async () => {
        const hasPermission = await ensurePermission();
        if (!hasPermission) {
            return null;
        }

        setIsFetching(true);
        try {
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
            return currentLocation;
        } catch (error) {
            console.warn('Erro ao obter localização atual:', error);
            return null;
        } finally {
            setIsFetching(false);
        }
    }, [ensurePermission]);

    useEffect(() => {
        fetchCurrentLocation();
    }, [fetchCurrentLocation]);

    return {
        location,
        permissionGranted: permissionInfo?.granted ?? false,
        status: permissionInfo?.status ?? PermissionStatus.UNDETERMINED,
        isFetching,
        refresh: fetchCurrentLocation,
        requestPermission: ensurePermission,
    };
}
