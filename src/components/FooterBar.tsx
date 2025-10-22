import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const FooterBar: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();

    const tabs = [
        {
            id: 'Home',
            label: 'Início',
            icon: 'home',
            iconFamily: 'FontAwesome' as const,
        },
        {
            id: 'Maps',
            label: 'Mapas',
            icon: 'map',
            iconFamily: 'FontAwesome' as const,
        },
        {
            id: 'Favorites',
            label: 'Favoritos',
            icon: 'heart',
            iconFamily: 'FontAwesome' as const,
        },
        {
            id: 'Settings',
            label: 'Perfil',
            icon: 'person',
            iconFamily: 'Ionicons' as const,
        },
    ];

    const renderIcon = (tab: any, isActive: boolean) => {
        const color = isActive ? theme.primary : theme.textSecondary;
        const size = 24;

        switch (tab.iconFamily) {
            case 'FontAwesome':
                return <FontAwesome name={tab.icon} size={size} color={color} />;
            case 'Ionicons':
                return <Ionicons name={tab.icon} size={size} color={color} />;
            default:
                return <FontAwesome name={tab.icon} size={size} color={color} />;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => {
                    const isActive = route.name === tab.id;
                    
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.tab}
                            onPress={() => navigation.navigate(tab.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.tabContent,
                                isActive && [styles.activeTabContent, { backgroundColor: theme.primary + '15' }]
                            ]}>
                                {renderIcon(tab, isActive)}
                                <Text style={[
                                    styles.tabLabel,
                                    { color: isActive ? theme.primary : theme.textSecondary },
                                    isActive && styles.activeTabLabel
                                ]}>
                                    {tab.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        minWidth: 60,
    },
    activeTabContent: {
        paddingVertical: 10,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
    },
    activeTabLabel: {
        fontWeight: '700',
    },
});

export default FooterBar;