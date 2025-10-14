import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Cards from '../components/Cards';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';

const HomeScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Navbar title="Home" onAvatarPress={() => navigation.navigate('Settings')} />
            <View style={styles.inner}>
                <Cards />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
});

export default HomeScreen;
