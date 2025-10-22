import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';

interface NavbarProps {
    title?: string;
    onAvatarPress?: () => void;
    showBack?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ title, onAvatarPress, showBack = false }) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    
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
            
            <View style={styles.rightSpace} />
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
});

export default Navbar;
