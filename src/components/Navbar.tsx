import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import { GoogleAuthService } from '../services/GoogleAuth.Service';

interface NavbarProps {
    title?: string;
    onAvatarPress?: () => void;
    showBack?: boolean;
    showLogout?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ title, onAvatarPress, showBack = false, showLogout = false }) => {
    const { theme } = useTheme();
    const { user, signOut } = useAuth();
    const navigation = useNavigation<any>();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const initials = user?.nome 
        ? user.nome.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() 
        : '?';

    const handleAvatarPress = () => {
        if (onAvatarPress) {
            onAvatarPress();
        } else {
            navigation.navigate('MainTabs', { 
                screen: 'Settings' 
            });
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoggingOut(true);
                            
                            // Fazer logout do Google se estiver logado
                            try {
                                await GoogleAuthService.signOut();
                            } catch (error) {
                                console.log('Não estava logado com Google');
                            }
                            
                            // Fazer logout da aplicação
                            await signOut();
                        } catch (error) {
                            Alert.alert(
                                'Erro',
                                'Não foi possível fazer logout. Tente novamente.'
                            );
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: theme.surface, 
                borderBottomColor: theme.border,
                shadowColor: theme.shadow 
            }
        ]}>
            {showBack ? (
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <FontAwesome name="arrow-left" size={20} color={theme.text} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarWrap}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.avatarText, { color: theme.white }]}>{initials}</Text>
                    </View>
                </TouchableOpacity>
            )}
            
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {title || 'Onde É, Manaus?'}
            </Text>
            
            {showLogout ? (
                isLoggingOut ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                    <TouchableOpacity 
                        onPress={handleLogout} 
                        style={styles.logoutButton}
                    >
                        <FontAwesome name="sign-out" size={20} color={theme.error} />
                    </TouchableOpacity>
                )
            ) : (
                <View style={styles.rightSpace} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 12,
        borderBottomWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarWrap: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontWeight: '700',
        fontSize: 16,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
    },
    rightSpace: {
        width: 40,
    },
    logoutButton: {
        padding: 8,
        marginLeft: 8,
    },
});

export default Navbar;
