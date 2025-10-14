import { faMoon } from '@fortawesome/free-regular-svg-icons';
import { faMobile, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { themeMode, setThemeMode, theme } = useTheme();

    const getNextMode = () => {
        switch (themeMode) {
            case 'light':
                return 'dark';
            case 'dark':
                return 'system';
            case 'system':
                return 'light';
            default:
                return 'light';
        }
    };

    const getModeIcon = () => {
        switch (themeMode) {
            case 'light':
                return "sun";
            case 'dark':
                return "moon";
            case 'system':
                return "mobile";
            default:
                return "mobile";
        }
    };

    const handlePress = () => {
        setThemeMode(getNextMode());
    };

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <FontAwesomeIcon icon={getModeIcon()} size={18} color={theme.text} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        alignSelf: 'flex-end',
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ThemeToggle;
