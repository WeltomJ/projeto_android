import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, loading = false, disabled = false, fullWidth = true }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { 
                    backgroundColor: theme.primary, 
                    opacity: disabled ? 0.6 : 1, 
                    alignSelf: fullWidth ? 'stretch' : 'center',
                    shadowColor: theme.shadow 
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={theme.white} />
            ) : (
                <Text style={[styles.text, { color: theme.white }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Button;
