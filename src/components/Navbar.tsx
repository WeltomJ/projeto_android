import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';

interface NavbarProps {
    title?: string;
    onAvatarPress?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, onAvatarPress }) => {
    const { theme } = useTheme();
    const { user, logout } = useAuth();
    const initials = user?.nome ? user.nome.split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase() : '?';
    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={onAvatarPress} style={styles.avatarWrap}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.primaryDark }]} numberOfLines={1}>{title || 'Onde É, Manaus?'}</Text>
            <TouchableOpacity onPress={logout}>
                <Text style={{ color: theme.error }}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    avatarWrap: { marginRight: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#888', alignItems:'center', justifyContent:'center' },
    avatarText: { color:'#fff', fontWeight:'600' },
    title: { fontSize: 18, fontWeight: '600', flex: 1 },
});

export default Navbar;
