import { MaterialIcons } from '@expo/vector-icons';
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
                return "wb-sunny";
            case 'dark':
                return "nightlight-round";
            case 'system':
                return "settings-brightness";
            default:
                return "settings-brightness";
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
            <MaterialIcons name={getModeIcon()} size={18} color={theme.text} />
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
