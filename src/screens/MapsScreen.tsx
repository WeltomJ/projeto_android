import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapsView from '../components/MapView';
import Navbar from '../components/Navbar';
import { useTheme } from '../utils/ThemeContext';

export default function MapScreen() {
    const { theme } = useTheme();
    
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar title="Mapa" />
            <View style={styles.mapContainer}>
                <MapsView />
            </View>
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
});